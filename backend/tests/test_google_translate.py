"""
Simple translation test with Deep Translator (Google Translate API)
Works reliably for all Indian languages
"""

from deep_translator import GoogleTranslator

print("Deep Translator (Google Translate) Test")
print("=" * 50)
print()

# Test 1: English to Hindi
print("Test 1: English → Hindi")
print("-" * 50)
text1 = "Hello, how are you?"
print(f"Input: {text1}")

translator = GoogleTranslator(source='en', target='hi')
result1 = translator.translate(text1)
print(f"Output: {result1}")
print("✓ Success!")
print()

# Test 2: English to Marathi  
print("Test 2: English → Marathi")
print("-" * 50)
text2 = "Welcome to the teacher training platform"
print(f"Input: {text2}")

translator = GoogleTranslator(source='en', target='mr')
result2 = translator.translate(text2)
print(f"Output: {result2}")
print("✓ Success!")
print()

# Test 3: English to Bengali
print("Test 3: English → Bengali")
print("-" * 50)
text3 = "Teacher training module"
print(f"Input: {text3}")

translator = GoogleTranslator(source='en', target='bn')
result3 = translator.translate(text3)
print(f"Output: {result3}")
print("✓ Success!")
print()

print("=" * 50)
print("✓ Translation Working!")
print()
print("Supported Languages (Google Translate):")
langs = {
    "Hindi": "hi",
    "Marathi": "mr", 
    "Bengali": "bn",
    "Telugu": "te",
    "Tamil": "ta",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Punjabi": "pa",
    "Urdu": "ur",
    "Odia": "or"
}

for name, code in langs.items():
    print(f"  - {name} ({code})")
