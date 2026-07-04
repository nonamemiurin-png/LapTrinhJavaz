import requests
import json
import os

API_KEY = os.getenv('GEMINI_API_KEY')
url = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
headers = {'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'}
data = {'model': 'gemini-1.5-flash', 'messages': [{'role': 'user', 'content': 'hello'}]}
r = requests.post(url, headers=headers, json=data)
print(r.status_code)
print(r.text)
