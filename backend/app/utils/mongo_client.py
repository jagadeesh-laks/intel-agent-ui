from mongoengine import connect
from flask import current_app

def get_mongo_client():
    """Get MongoDB client instance."""
    try:
        # Get MongoDB URI from Flask app config
        mongo_uri = current_app.config.get('MONGODB_URI', 'mongodb://localhost:27017/mydb')
        
        # Connect to MongoDB
        client = connect(host=mongo_uri)
        
        return client
    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")
        raise 