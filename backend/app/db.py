from pymongo import MongoClient
import os
from typing import Optional

_client: Optional[MongoClient] = None

def get_mongo_client() -> MongoClient:
    """Get MongoDB client instance."""
    global _client
    if _client is None:
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        _client = MongoClient(mongo_uri)
    return _client

def close_mongo_client():
    """Close MongoDB client connection."""
    global _client
    if _client is not None:
        _client.close()
        _client = None 