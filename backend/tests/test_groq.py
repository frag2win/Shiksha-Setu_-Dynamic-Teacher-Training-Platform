"""
Quick test script to verify Groq API connectivity
"""
import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

print("Testing Groq API connection...")
print("-" * 50)

try:
    # Simple test call
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Respond concisely."
            },
            {
                "role": "user",
                "content": "Say 'Hello! Groq API is working successfully.' if you can read this."
            }
        ],
        temperature=0.7,
        max_tokens=100
    )
    
    # Display results
    print("✓ SUCCESS: Groq API is working!")
    print(f"\nModel: {response.model}")
    print(f"Response: {response.choices[0].message.content}")
    print(f"\nTokens used: {response.usage.total_tokens}")
    print(f"- Prompt tokens: {response.usage.prompt_tokens}")
    print(f"- Completion tokens: {response.usage.completion_tokens}")
    print("-" * 50)
    print("✓ Groq integration ready for use!")
    
except Exception as e:
    print(f"✗ ERROR: {str(e)}")
    print("\nPlease check:")
    print("1. GROQ_API_KEY is set correctly in .env file")
    print("2. API key is valid and active")
    print("3. Internet connection is available")
