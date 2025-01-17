#!/bin/bash

# Start the first FastAPI app
echo "Starting ChatBot app"
uvicorn chatbot:app --host 127.0.0.1 --port 8001 &  
# Start the second FastAPI app
echo "Starting Websocket app.."
uvicorn websocket:app --host 127.0.0.1 --port 8000 &  

