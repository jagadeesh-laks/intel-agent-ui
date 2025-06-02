import aiohttp
from typing import List, Dict, Any
from .base import BaseAIClient
import os
import requests
import logging

logger = logging.getLogger(__name__)

class OpenAIClient(BaseAIClient):
    def __init__(self, api_key: str):
        super().__init__()
        self.api_key = api_key
        self.model = os.getenv("DEFAULT_AI_MODEL", "gpt-3.5-turbo")
        self.base_url = "https://api.openai.com/v1"

    def chat(self, messages: List[Dict[str, str]]) -> str:
        """Send a chat request to OpenAI API."""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data
            )
            
            if response.status_code != 200:
                error_msg = f"Error code: {response.status_code} - {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)
                
            return response.json()["choices"][0]["message"]["content"]
            
        except Exception as e:
            logger.error(f"Error in OpenAI chat: {str(e)}")
            raise

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        functions: List[Dict[str, Any]],
        function_call: str = "auto"
    ) -> Dict[str, Any]:
        """Get chat completion from OpenAI."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "functions": functions,
            "function_call": function_call
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"OpenAI API error: {error_text}")
                
                return await response.json() 