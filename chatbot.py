# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from session.session import *
from config.settings import DEFAULT_SYSTEM_PROMPT, CHROME_EXTENSION_ID, PLUGGING_ID
import logging
import yaml
import logging.config

# Load the YAML logging configuration
with open("logging_config.yaml", "r") as f:
    config = yaml.safe_load(f)
    logging.config.dictConfig(config)

# Create the FastAPI application
app = FastAPI()

# Logger for this FastAPI app
logger = logging.getLogger("chatbot")


# Create FastAPI instance
app = FastAPI()

# Define Pydantic models
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


# Add CORS middleware to allow requests from your Chrome extension
origins = [
    f"chrome-extension://{CHROME_EXTENSION_ID}"  # Replace with your actual extension ID
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow your extension to access the API
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)


# Initialize system prompt and plugins
system_prompt = DEFAULT_SYSTEM_PROMPT
plugin_ids = PLUGGING_ID


# API endpoint to read root
@app.get("/")
async def read_root():
    return {"message": "hello"}


# API endpoint to start a chat session
@app.get("/start_session")
async def start_session():
    session_id = await create_chat_session()
    if not session_id:
        return {"error": "Failed to create a session."}
    return {"session_id": session_id}


# API endpoint to send chat messages
@app.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_request: ChatRequest):
    user_message = chat_request.message
    if not user_message.strip():
        return {"response": "Please enter a valid message."}

    # Combine system prompt with user message
    full_query = f"{system_prompt}\n{user_message}"
    session_id = await create_chat_session()

    if not session_id:
        return {"response": "Failed to create a session."}

    # Submit query and get chatbot response
    response = await submit_query(session_id, full_query, plugin_ids)

    return {"response": response}


# Health check to confirm server is running
@app.get("/health")
async def health_check():
    return {"status": "OK"}
