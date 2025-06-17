import requests
from typing import List, Dict, Any
from .base import BaseAIClient
import logging
import json

logger = logging.getLogger(__name__)

class OllamaClient(BaseAIClient):
    def __init__(self, host_url: str):
        """Initialize Ollama client.
        
        Args:
            host_url: The URL of the Ollama server (e.g. "http://localhost:11434")
        """
        super().__init__()
        self.host_url = host_url.rstrip('/')
        self.model = "llama3.2:latest"  # Default model

    def chat(self, messages: List[Dict[str, str]]) -> str:
        """Send a chat request to Ollama API."""
        try:
            logger.debug(f"Sending chat request to Ollama with {len(messages)} messages")
            logger.debug(f"Messages: {messages}")

            # Convert messages to Ollama format
            ollama_messages = []
            for msg in messages:
                # Ensure each message has both role and content
                if not isinstance(msg, dict) or 'role' not in msg or 'content' not in msg:
                    logger.error(f"Invalid message format: {msg}")
                    continue
                    
                ollama_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

            if not ollama_messages:
                raise ValueError("No valid messages to send to Ollama")

            # Make request to Ollama API
            response = requests.post(
                f"{self.host_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": ollama_messages,
                    "stream": False
                }
            )
            
            if response.status_code != 200:
                error_msg = f"Error code: {response.status_code} - {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)

            response_data = response.json()
            if not response_data or "message" not in response_data:
                raise ValueError(f"Invalid response from Ollama: {response_data}")

            return response_data["message"]["content"]
            
        except Exception as e:
            logger.error(f"Error in Ollama chat: {str(e)}")
            raise 