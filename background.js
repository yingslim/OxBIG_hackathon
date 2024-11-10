// Establish the WebSocket connection
const socket = new WebSocket("ws://127.0.0.1:8000/ws/chat");

// Handle connection open event
socket.onopen = function(event) {
    console.log("WebSocket connection opened.");
    // Send an initial message if needed
    socket.send(JSON.stringify({ message: "Hello from background.js" }));
};

// Handle incoming messages
socket.onmessage = function(event) {
    const message = event.data;
    console.log("Message from Chatbot:", message);
    
    // Example action based on the message received
    if (message.includes("some_keyword")) {
        // Perform an action, such as sending a notification to the user
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "New Message",
            message: "You have a new interaction!"
        });
    }
};

// Handle WebSocket close
socket.onclose = function(event) {
    if (event.wasClean) {
        console.log(`WebSocket closed cleanly, code=${event.code}`);
    } else {
        console.error("WebSocket closed unexpectedly.");
    }
};

// Handle WebSocket errors
socket.onerror = function(error) {
    console.error("WebSocket error:", error);
};

// Function to send messages to FastAPI
function sendMessageToFastAPI(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ message }));
    } else {
        console.error("WebSocket is not open.");
    }
}

// Listen for events from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "USER_INTERACTION") {
        // Send the user interaction to FastAPI
        sendMessageToFastAPI(request.message);
        sendResponse({ status: "Message sent to Chatbot" });
    }
});
