// Create a WebSocket connection to the FastAPI WebSocket endpoint
const socket = new WebSocket('ws://localhost:8000/ws/chat');
socket.onmessage = function(e){ console.log(e.data); };
socket.onopen = () => socket.send('hello');

// This runs when the WebSocket connection is opened
socket.onopen = () => {
console.log('WebSocket connection established');
};


document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const questionElement = document.getElementById('question');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') 
            sendMessage();
        }
    );

    // Function to update the question dynamically
    function updateQuestion(product) {
        questionElement.textContent = `Is '${product}' an essential purchase?`;
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            appendMessage('You', message);
            socket.send(message);
            console.log(message);
            userInput.value = '';
            console.log('Message Sent');
        }
    }

    function appendMessage(sender, message, isMarkdown = false) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        const senderElement = document.createElement('strong');
        senderElement.textContent = sender + ': ';
        messageElement.appendChild(senderElement);

        const contentElement = document.createElement('span');
        if (isMarkdown) {
            contentElement.innerHTML = marked.parse(message);
        } else {
            contentElement.textContent = message;
        }
        messageElement.appendChild(contentElement);

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Listen for messages from the content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "updateProduct") {
            updateQuestion(request.product);
        }
    });

    

    // This runs when the WebSocket receives a message from the server
    socket.onmessage = (event) => {
        const message = event.data;
        // If the message contains the system prompt, ignore it
        if (message.includes("System Prompt:")) {
        return; // Ignore the system prompt message, don't display it
        }
        appendMessage("Bot", message)

    };

    // This runs if the WebSocket connection is closed
    socket.onclose = () => {
    console.log('WebSocket connection closed');
    };

    // This runs if there's an error in the WebSocket connection
    socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    };

    // Send query when the user clicks the send button
    document.getElementById('send-button').addEventListener('click', async () => {
        sendMessage();
    });
});

