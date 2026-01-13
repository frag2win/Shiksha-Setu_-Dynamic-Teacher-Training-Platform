"""Quick Translation Test"""
import requests

print("Testing Translation API...")
print("-" * 50)

try:
    response = requests.post(
        "http://localhost:8000/api/translation/translate",
        json={"text": "Hello World", "target_language": "hindi"},
        timeout=15
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Original: {data['original_text']}")
        print(f"Translated: {data['translated_text']}")
        print("\n✅ Translation Working!")
    else:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Error: {str(e)}")

print("-" * 50)

# Test languages endpoint
try:
    response = requests.get("http://localhost:8000/api/translation/languages", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"\nSupported Languages: {len(data.get('languages', []))}")
        print(f"Languages: {', '.join(data.get('languages', [])[:6])}...")
except Exception as e:
    print(f"Languages endpoint error: {str(e)}")
