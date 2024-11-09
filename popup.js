document.getElementById('sendButton').addEventListener('click', async () => {
    const query = document.getElementById('query').value;
    if (query.trim() === '') {
      alert('Please enter a query.');
      return;
    }
  
    // Send the query to the background script
    chrome.runtime.sendMessage({ action: 'sendQuery', query: query }, (response) => {
      if (response && response.answer) {
        document.getElementById('response').textContent = response.answer;
      } else {
        document.getElementById('response').textContent = 'No response received.';
      }
    });
});