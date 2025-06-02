from datetime import datetime
from bson import ObjectId
import json

class Chat:
    def __init__(self, db):
        self.db = db
        self.collection = db.chats
        self.intents = {
            'sprint_status': ['sprint status', 'current sprint', 'sprint progress'],
            'create_sprint': ['create sprint', 'new sprint', 'start sprint'],
            'team_velocity': ['team velocity', 'velocity chart', 'sprint velocity'],
            'burndown': ['burndown', 'burndown chart', 'sprint burndown'],
            'jira_tasks': ['jira tasks', 'my tasks', 'assigned tasks'],
            'ollama_query': ['ask ollama', 'ollama help', 'ai assistance']
        }

    def create_message(self, user_id, message, intent=None, response=None):
        chat = {
            'user_id': user_id,
            'message': message,
            'intent': intent,
            'response': response,
            'created_at': datetime.utcnow()
        }
        result = self.collection.insert_one(chat)
        chat['_id'] = str(result.inserted_id)
        return chat

    def get_user_chats(self, user_id, limit=50):
        chats = list(self.collection.find(
            {'user_id': user_id}
        ).sort('created_at', -1).limit(limit))
        
        for chat in chats:
            chat['_id'] = str(chat['_id'])
        return chats

    def detect_intent(self, message):
        message = message.lower()
        for intent, patterns in self.intents.items():
            if any(pattern in message for pattern in patterns):
                return intent
        return None

    def get_chat_history(self, user_id, limit=10):
        return self.get_user_chats(user_id, limit) 