from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from session.session import create_chat_session, submit_query
from config.settings import DEFAULT_SYSTEM_PROMPT, PLUGGING_ID, HOSTNAME, CHAT_PORT
from typing import List
import requests

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, WebSocket, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Store active sessions in-memory (can be replaced with persistent storage like a database)
active_sessions = {}

# Plugin IDs for integration
plugin_ids = PLUGGING_ID


@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Create a new chat session when a user connects
    session_id = await create_chat_session()
    if not session_id:
        await websocket.send_text("Error creating session.")
        await websocket.close()
        return

    # Store session ID and WebSocket connection for the active user
    active_sessions[session_id] = websocket

    # Send system prompt to user at the start of the session
    system_prompt = DEFAULT_SYSTEM_PROMPT
    await websocket.send_text(f"System Prompt: {system_prompt}")

    try:
        while True:
            # Wait for the user message
            user_message = await websocket.receive_text()

            if user_message.strip().lower() == "exit":
                await websocket.send_text("Exiting the chatbot.")
                break

            # Combine system prompt and user message for processing
            full_query = f"{system_prompt}\n{user_message}"

            url = f" http://{HOSTNAME}:{CHAT_PORT}/chat"

            # Set up the payload with the required 'message' field
            payload = {"message": full_query}

            # Headers for the request
            headers = {"Content-Type": "application/json"}

            # Make the POST request
            response = requests.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                data = response.json()
                answer = data["response"]
                print(f"\nAssistant: {answer}")
            else:
                print("Failed to get response.")
                answer = "Error: No response from model."

            # Send the response back to the user
            await websocket.send_text(f"{answer}")

    except WebSocketDisconnect:
        # Handle client disconnection
        del active_sessions[session_id]
        print(f"Session {session_id} disconnected")


@app.get("/")
async def get():
    return {"message": "Chatbot server is running."}
