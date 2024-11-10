// Create a WebSocket connection to the FastAPI WebSocket endpoint
const socket = new WebSocket('ws://localhost:8000/ws/chat');

// This runs when the WebSocket connection is opened
socket.onopen = () => {
  console.log('WebSocket connection established');
};

// This runs when the WebSocket receives a message from the server
socket.onmessage = (event) => {
  const responseDiv = document.getElementById('response');
  const message = event.data;
   // If the message contains the system prompt, ignore it
   if (message.includes("System Prompt:")) {
    return; // Ignore the system prompt message, don't display it
  }


  // Display the server's response in the 'response' div
  responseDiv.textContent = message;
  // Remove the "loading" message once the response is received
  responseDiv.classList.remove('loading');
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
document.getElementById('sendButton').addEventListener('click', async () => {
  const query = document.getElementById('query').value;

  if (query.trim() === '') {
    alert('Please enter a query.');
    return;
  }

  // Show a loading message while waiting for the response
  const responseDiv = document.getElementById('response');
  responseDiv.textContent = 'Loading...';
  responseDiv.classList.add('loading');

  // Send the query to the WebSocket server
  socket.send(query);

  // Clear the input box after sending
  document.getElementById('query').value = '';
});
