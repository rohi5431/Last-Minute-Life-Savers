import json
from typing import Optional, Dict, Any
from langchain_groq import ChatGroq
from langchain_community.llms import Ollama
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class LLMClient:
    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        self.groq_model = settings.GROQ_MODEL
        self.ollama_base_url = settings.OLLAMA_BASE_URL
        self.ollama_model = settings.OLLAMA_MODEL
        self._groq_client = None
        self._ollama_client = None

    @property
    def groq_client(self):
        if self._groq_client is None and self.groq_api_key:
            self._groq_client = ChatGroq(
                groq_api_key=self.groq_api_key,
                model_name=self.groq_model,
                temperature=0.3,
            )
        return self._groq_client

    @property
    def ollama_client(self):
        if self._ollama_client is None:
            self._ollama_client = Ollama(
                base_url=self.ollama_base_url,
                model=self.ollama_model,
                temperature=0.3,
            )
        return self._ollama_client

    def call(self, prompt: str, max_tokens: int = 1024) -> str:
        try:
            if self.groq_client:
                response = self.groq_client.invoke(prompt)
                return response.content
        except Exception as e:
            logger.warning(f"Groq call failed: {e}, falling back to Ollama")

        try:
            if self.ollama_client:
                response = self.ollama_client.invoke(prompt)
                return response
        except Exception as e:
            logger.error(f"Ollama call also failed: {e}")

        raise RuntimeError("Both Groq and Ollama failed")

    def call_json(self, prompt: str) -> Dict[str, Any]:
        response = self.call(prompt)
        try:
            start_chars = ["{", "["]
            json_start = -1
            start_char_found = None
            for idx, char in enumerate(response):
                if char in start_chars:
                    json_start = idx
                    start_char_found = char
                    break
            
            if json_start >= 0:
                end_char = "}" if start_char_found == "{" else "]"
                json_end = response.rfind(end_char) + 1
                if json_end > json_start:
                    json_str = response[json_start:json_end]
                    return json.loads(json_str)
            return json.loads(response)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from LLM response: {e}. Raw response: {response}")
            return {"error": "Failed to parse LLM response", "raw": response}


llm_client = LLMClient()
