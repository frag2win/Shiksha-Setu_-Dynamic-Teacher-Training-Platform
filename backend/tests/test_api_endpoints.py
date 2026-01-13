"""
API Endpoints Test
Test all backend API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 70)
print("TESTING BACKEND API ENDPOINTS")
print("=" * 70)

# Test 1: Root endpoint
print("\n1. Testing Root Endpoint (GET /)...")
try:
    response = requests.get(f"{BASE_URL}/")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ Message: {data.get('message')}")
        print(f"   ✓ Version: {data.get('version')}")
    else:
        print(f"   ✗ Failed with status: {response.status_code}")
except Exception as e:
    print(f"   ✗ Error: {str(e)}")

# Test 2: Translation endpoint
print("\n2. Testing Translation Endpoint (POST /api/translation/translate)...")
try:
    payload = {
        "text": "Welcome to Shiksha Setu",
        "target_language": "hindi"
    }
    response = requests.post(f"{BASE_URL}/api/translation/translate", json=payload)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ Translation: {data.get('translated_text')}")
    else:
        print(f"   ✗ Failed with status: {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ Error: {str(e)}")

# Test 3: Get supported languages
print("\n3. Testing Supported Languages (GET /api/translation/languages)...")
try:
    response = requests.get(f"{BASE_URL}/api/translation/languages")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ Supported Languages: {', '.join(data.get('languages', []))}")
    else:
        print(f"   ✗ Failed with status: {response.status_code}")
except Exception as e:
    print(f"   ✗ Error: {str(e)}")

# Test 4: Clusters endpoint
print("\n4. Testing Clusters Endpoint (GET /api/clusters)...")
try:
    response = requests.get(f"{BASE_URL}/api/clusters")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ Found {len(data)} clusters")
    else:
        print(f"   ✗ Failed with status: {response.status_code}")
except Exception as e:
    print(f"   ✗ Error: {str(e)}")

# Test 5: API docs
print("\n5. Testing API Documentation (GET /docs)...")
try:
    response = requests.get(f"{BASE_URL}/docs")
    if response.status_code == 200:
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ API Documentation accessible at {BASE_URL}/docs")
    else:
        print(f"   ✗ Failed with status: {response.status_code}")
except Exception as e:
    print(f"   ✗ Error: {str(e)}")

print("\n" + "=" * 70)
print("API ENDPOINTS TEST COMPLETE")
print("=" * 70)
print(f"\n✅ Server running at: {BASE_URL}")
print(f"✅ API Documentation: {BASE_URL}/docs")
print(f"✅ Interactive API: {BASE_URL}/redoc")
