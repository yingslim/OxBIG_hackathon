import requests
import json
from config.settings import headers
import uuid



def create_chat_session():
    url = "https://api.on-demand.io/chat/v1/sessions"
    external_user_id = str(uuid.uuid4())
    payload = {
        "externalUserId": external_user_id
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))

    session_id = response.json()['data']['id']
    print(f"\nChat session created successfully.\nSession ID: {session_id}")
    return session_id


    
def submit_query(session_id, query, plugin_ids=[]):
    url = f"https://api.on-demand.io/chat/v1/sessions/{session_id}/query"
    payload = {
        "endpointId": "predefined-openai-gpt4o",
        "query": query,
        "pluginIds": plugin_ids,
        "responseMode": "sync"
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        data = response.json()['data']
        answer = data.get('answer', '')
        print(f"\nAssistant: {answer}")
        return answer
    else:
        print("Failed to get response.")
        print(response.text)
        return None
