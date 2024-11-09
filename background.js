chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sendQuery') {
      const query = message.query;
      // Call the function to send the query to OnDemand API
      sendQueryToOnDemand(query)
        .then((answer) => {
          sendResponse({ answer: answer });
        })
        .catch((error) => {
          console.error(error);
          sendResponse({ answer: 'Error: ' + error.message });
        });
      // Keep the message channel open for the asynchronous response
      return true;
    }
  });
  
  async function sendQueryToOnDemand(query) {
    const apiKey = 'gItLAYFOlta67dGuktAlhNghlqKlLoOx'; // API Key
    const sessionId = await getSessionId(apiKey);
    if (!sessionId) {
      throw new Error('Failed to create or retrieve session ID.');
    }
  
    const url = `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`;
    const payload = {
      endpointId: 'predefined-openai-gpt4o',
      query: query,
      pluginIds: [],
      responseMode: 'sync'
    };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify(payload)
    });
  
    if (!response.ok) {
      throw new Error('Error submitting query: ' + response.statusText);
    }
  
    const data = await response.json();
  
    if (data && data.data && data.data.answer) {
      return data.data.answer;
    } else {
      throw new Error('No answer received from OnDemand API.');
    }
  }
  
  async function getSessionId(apiKey) {
    // Check if sessionId is stored
    let sessionId = await getStoredSessionId();
    if (sessionId) {
      return sessionId;
    }
  
    // Create a new session
    const url = 'https://api.on-demand.io/chat/v1/sessions';
    const payload = { externalUserId: 'chrome_extension_user' };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify(payload)
    });
  
    if (!response.ok) {
      console.error('Failed to create session:', response.statusText);
      return null;
    }
  
    const data = await response.json();
  
    if (data && data.data && data.data.id) {
      sessionId = data.data.id;
      // Store the sessionId for future use
      await storeSessionId(sessionId);
      return sessionId;
    } else {
      console.error('No session ID received:', data);
      return null;
    }
  }
  
  function getStoredSessionId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['sessionId'], (result) => {
        resolve(result.sessionId);
      });
    });
  }
  
  function storeSessionId(sessionId) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ sessionId: sessionId }, () => {
        resolve();
      });
    });
}

