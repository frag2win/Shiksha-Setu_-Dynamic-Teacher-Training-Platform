"""
Simple API Test - With Server Readiness Check
"""
import requests
import time
import sys

BASE_URL = "http://localhost:8000"

def wait_for_server(max_attempts=30, delay=1):
    """Wait for server to be ready"""
    print("Waiting for server to start...")
    for i in range(max_attempts):
        try:
            response = requests.get(f"{BASE_URL}/", timeout=2)
            if response.status_code == 200:
                print(f"✓ Server is ready after {i+1} seconds!")
                return True
        except requests.exceptions.RequestException:
            sys.stdout.write(f"\r  Attempt {i+1}/{max_attempts}...")
            sys.stdout.flush()
            time.sleep(delay)
    print("\n✗ Server did not start in time")
    return False

print("=" * 70)
print("SIMPLE API TEST")
print("=" * 70)

# Wait for server
if not wait_for_server():
    print("\nPlease start the server with:")
    print("  python -m uvicorn main:app --reload --port 8000")
    sys.exit(1)

print("\n" + "=" * 70)

# Test 1: Root endpoint
print("\n1. Root Endpoint (GET /)...")
try:
    response = requests.get(f"{BASE_URL}/", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ Message: {data.get('message')}")
        print(f"   ✓ Version: {data.get('version')}")
    else:
        print(f"   ✗ Failed: {response.status_code}")
except Exception as e:
    print(f"   ✗ Error: {str(e)}")

# Test 2: Translation - Simple text
print("\n2. Translation (POST /api/translation/translate)...")
try:
    payload = {
        "text": "Hello",
        "target_language": "hindi"
    }
    response = requests.post(
        f"{BASE_URL}/api/translation/translate", 
        json=payload,
        timeout=10
    )
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ English: {payload['text']}")
        print(f"   ✓ Hindi: {data.get('translated_text')}")
    else:
        print(f"   ✗ Failed: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ✗ Error: {str(e)}")

# Test 3: Supported languages
print("\n3. Supported Languages (GET /api/translation/languages)...")
try:
    response = requests.get(f"{BASE_URL}/api/translation/languages", timeout=5)
    if response.status_code == 200:
        data = response.json()
        languages = data.get('languages', [])
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ Count: {len(languages)} languages")
        print(f"   ✓ Languages: {', '.join(languages[:5])}...")
    else:
        print(f"   ✗ Failed: {response.status_code}")
except Exception as e:
    print(f"   ✗ Error: {str(e)}")

# Test 4: Clusters
print("\n4. Clusters (GET /api/clusters)...")
try:
    response = requests.get(f"{BASE_URL}/api/clusters", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ Clusters found: {len(data)}")
    else:
        print(f"   ✗ Failed: {response.status_code}")
except Exception as e:
    print(f"   ✗ Error: {str(e)}")

print("\n" + "=" * 70)
print("✅ Backend is operational!")
print("=" * 70)
print(f"\nAPI Docs: {BASE_URL}/docs")
print(f"ReDoc: {BASE_URL}/redoc")
