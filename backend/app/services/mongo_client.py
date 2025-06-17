from pymongo import MongoClient
import os
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

_client: Optional[MongoClient] = None

def get_mongo_client() -> MongoClient:
    """Get MongoDB client instance."""
    global _client
    if _client is None:
        try:
            # Get MongoDB URI from environment variable or use default
            mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
            logger.debug(f"Connecting to MongoDB at {mongo_uri}")
            _client = MongoClient(mongo_uri)
            # Test connection
            _client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {str(e)}")
            raise
    return _client

def close_mongo_client():
    """Close MongoDB client connection."""
    global _client
    if _client is not None:
        try:
            _client.close()
            logger.info("Closed MongoDB connection")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {str(e)}")
        finally:
            _client = None 