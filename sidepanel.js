
document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const questionElement = document.getElementById('question');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Function to update the question dynamically
    function updateQuestion(product) {
        questionElement.textContent = `Is '${product}' an essential purchase?`;
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            appendMessage('You', message);
            userInput.value = '';
            
            // Send message to background script
            chrome.runtime.sendMessage({action: "sendQuery", query: message}, function(response) {
                if (response && response.answer) {
                    appendMessage('Advisor', response.answer, true);
                } else {
                    appendMessage('Advisor', 'Sorry, I encountered an error processing your request.');
                }
            });
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
});
