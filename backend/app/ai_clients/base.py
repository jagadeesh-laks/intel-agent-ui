from abc import ABC, abstractmethod
from typing import List, Dict, Any
import os
from ..db import get_mongo_client
from openai import OpenAI
import google.generativeai as genai
import ollama

class BaseAIClient:
    def __init__(self):
        pass

    def chat(self, messages):
        """Base chat method to be implemented by specific clients."""
        raise NotImplementedError("Subclasses must implement chat method")

class AIClientFactory:
    @staticmethod
    def create_client(ai_engine: str, api_key: str) -> BaseAIClient:
        """Create an AI client based on the engine type."""
        ai_engine = ai_engine.lower()
        
        if ai_engine == "openai":
            from .openai_client import OpenAIClient
            return OpenAIClient(api_key)
        elif ai_engine == "anthropic":
            from .anthropic_client import AnthropicClient
            return AnthropicClient(api_key)
        else:
            raise ValueError(f"Unsupported AI engine: {ai_engine}")

class ChatGPTClient(BaseAIClient):
    def __init__(self, credentials):
        super().__init__()
        self.client = OpenAI(api_key=credentials)

    def chat(self, messages):
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error in ChatGPT client: {str(e)}")

class GeminiClient(BaseAIClient):
    def __init__(self, credentials):
        super().__init__()
        self.client = genai.GenerativeModel('gemini-pro')
        genai.configure(api_key=credentials)

    def chat(self, messages):
        try:
            # Convert messages to Gemini format
            gemini_messages = []
            for msg in messages:
                if msg["role"] == "user":
                    gemini_messages.append({"role": "user", "parts": [msg["content"]]})
                elif msg["role"] == "assistant":
                    gemini_messages.append({"role": "model", "parts": [msg["content"]]})
                elif msg["role"] == "system":
                    # Add system message as user message
                    gemini_messages.append({"role": "user", "parts": [msg["content"]]})

            chat = self.client.start_chat(history=gemini_messages)
            response = chat.send_message(messages[-1]["content"])
            return response.text
        except Exception as e:
            raise Exception(f"Error in Gemini client: {str(e)}")

class OllamaClient(BaseAIClient):
    def __init__(self, credentials):
        super().__init__()
        # credentials should be the host URL for Ollama
        self.host = credentials if credentials else "http://localhost:11434"

    def chat(self, messages):
        try:
            # Convert messages to Ollama format
            ollama_messages = []
            for msg in messages:
                ollama_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

            # Use the ollama.chat function directly
            response = ollama.chat(
                model="llama2",
                messages=ollama_messages,
                host=self.host
            )
            return response["message"]["content"]
        except Exception as e:
            raise Exception(f"Error in Ollama client: {str(e)}") 