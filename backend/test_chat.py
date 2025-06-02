import asyncio
from app.routes.chat import chat
from flask import Flask, request
import json

app = Flask(__name__)

@app.route('/test', methods=['POST'])
async def test_chat():
    # Mock request data
    request_data = {
        "aiEngine": "openai",
        "projectKey": "TEST",
        "boardId": 1,
        "userMessage": "Create a new sprint starting next week"
    }
    
    # Mock current_user
    current_user = {
        "_id": "test_user_id",
        "email": "test@example.com"
    }
    
    # Call the chat function
    response = await chat(current_user)
    return response

if __name__ == '__main__':
    app.run(debug=True, port=6001) 