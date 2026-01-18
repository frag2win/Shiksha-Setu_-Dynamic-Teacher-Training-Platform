/**
 * Translation Page (Page 5)
 * Multilingual translation for training content - Any language to any language
 * Horizontal layout with voice-to-text support
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Languages,
  ArrowRight,
  ArrowLeftRight,
  Copy,
  Check,
  RefreshCw,
  Volume2,
  Mic,
  MicOff,
  Square,
} from 'lucide-react';
import { PageTransition, FadeIn } from '../ui/PageTransition';
import { Alert, LoadingSpinner } from '../ui/SharedComponents';
import { translate } from '../../services/api';

// Supported languages (Indian + English) with speech recognition codes
const LANGUAGES = [
  { code: 'english', name: 'English', native: 'English', speechCode: 'en-IN' },
  { code: 'hindi', name: 'Hindi', native: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'marathi', name: 'Marathi', native: 'मराठी', speechCode: 'mr-IN' },
  { code: 'bengali', name: 'Bengali', native: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'tamil', name: 'Tamil', native: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'telugu', name: 'Telugu', native: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'gujarati', name: 'Gujarati', native: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'kannada', name: 'Kannada', native: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'malayalam', name: 'Malayalam', native: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'punjabi', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
  { code: 'odia', name: 'Odia', native: 'ଓଡ଼ିଆ', speechCode: 'or-IN' },
  { code: 'urdu', name: 'Urdu', native: 'اردو', speechCode: 'ur-IN' },
];

// Voice-to-Text Hook using Web Speech API
function useSpeechRecognition(language) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += result + ' ';
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current && language) {
      const lang = LANGUAGES.find(l => l.code === language);
      if (lang) {
        recognitionRef.current.lang = lang.speechCode;
      }
    }
  }, [language]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    setError(null);
    setTranscript('');
    
    const lang = LANGUAGES.find(l => l.code === language);
    if (lang) {
      recognitionRef.current.lang = lang.speechCode;
    }
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice recognition. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    clearError: () => setError(null),
  };
}

export default function TranslationPage() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('english');
  const [targetLanguage, setTargetLanguage] = useState('hindi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Voice recognition hook
  const speech = useSpeechRecognition(sourceLanguage);

  // Update source text when speech transcript changes
  useEffect(() => {
    if (speech.transcript) {
      setSourceText(prev => prev + speech.transcript);
      speech.resetTranscript();
    }
  }, [speech.transcript]);

  // Show speech errors
  useEffect(() => {
    if (speech.error) {
      setError(speech.error);
      speech.clearError();
    }
  }, [speech.error]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    if (sourceLanguage === targetLanguage) {
      setError('Source and target languages must be different');
      return;
    }

    setLoading(true);
    setError(null);
    setTranslatedText('');

    try {
      const result = await translate(sourceText, targetLanguage, sourceLanguage);
      setTranslatedText(result.translated_text);
    } catch (err) {
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setError(null);
  };

  const sourceLang = LANGUAGES.find(l => l.code === sourceLanguage);
  const targetLang = LANGUAGES.find(l => l.code === targetLanguage);

  return (
    <PageTransition>
      <div className="page">
        {/* Compact Header with Language Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-setu)' }}
            >
              <Languages className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-400)' }}>Page 5</p>
              <h1 className="text-xl font-serif" style={{ color: 'var(--ink-100)' }}>
                Translation
              </h1>
            </div>
          </div>
          
          {/* Language Selector Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="form-input form-select py-2 text-sm"
              style={{ minWidth: '140px' }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.name})
                </option>
              ))}
            </select>

            <motion.button
              onClick={handleSwapLanguages}
              className="btn btn-ghost btn-icon"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              title="Swap languages"
            >
              <ArrowLeftRight className="w-4 h-4" style={{ color: 'var(--setu-400)' }} />
            </motion.button>

            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="form-input form-select py-2 text-sm"
              style={{ minWidth: '140px' }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.name})
                </option>
              ))}
            </select>

            <motion.button
              onClick={handleTranslate}
              disabled={loading || !sourceText.trim() || sourceLanguage === targetLanguage}
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  Translate
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <Alert type="error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}
        </AnimatePresence>

        {/* Horizontal Translation Panels */}
        <FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Source Panel */}
            <div 
              className="card relative overflow-hidden"
              style={{ 
                background: 'var(--gradient-paper)',
                border: '1px solid var(--paper-300)',
              }}
            >
              {/* Accent stripe */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'var(--gradient-setu)' }}
              />

              {/* Header */}
              <div 
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--paper-200)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--ink-200)' }}>
                    {sourceLang?.native}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--ink-400)' }}>
                    ({sourceLang?.name})
                  </span>
                </div>

                {/* Voice Input Button */}
                {speech.isSupported && (
                  <motion.button
                    onClick={speech.isListening ? speech.stopListening : speech.startListening}
                    className={`btn btn-icon relative ${speech.isListening ? 'btn-danger' : 'btn-ghost'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={speech.isListening ? 'Stop recording' : `Speak in ${sourceLang?.name}`}
                  >
                    {speech.isListening ? (
                      <>
                        <Square className="w-4 h-4" />
                        {/* Pulsing ring when recording */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ border: '2px solid var(--danger-400)' }}
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </>
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder={`Enter ${sourceLang?.name} text to translate...\n\nPaste your training content, lesson text, or instructions here.`}
                  className="w-full h-48 p-4 resize-none border-0 focus:outline-none focus:ring-0"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: 'var(--ink-200)',
                  }}
                />

                {/* Recording indicator */}
                <AnimatePresence>
                  {speech.isListening && (
                    <motion.div
                      className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{ background: 'var(--danger-100)' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--danger-500)' }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      <span className="text-xs font-medium" style={{ color: 'var(--danger-700)' }}>
                        Listening in {sourceLang?.native}...
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div 
                className="px-4 py-2 flex items-center justify-between"
                style={{ 
                  borderTop: '1px solid var(--paper-200)',
                  backgroundColor: 'var(--paper-100)',
                }}
              >
                <span className="text-xs" style={{ color: 'var(--ink-400)' }}>
                  {sourceText.length} characters
                </span>
                <button
                  onClick={handleClear}
                  className="btn btn-ghost btn-sm"
                  disabled={!sourceText && !translatedText}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Target Panel */}
            <div 
              className="card relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, var(--teal-50) 0%, var(--paper-50) 100%)',
                border: '1px solid var(--teal-200)',
              }}
            >
              {/* Accent stripe */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'var(--gradient-teal-spark)' }}
              />

              {/* Header */}
              <div 
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--teal-100)' }}
              >
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4" style={{ color: 'var(--teal-600)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--ink-200)' }}>
                    {targetLang?.native}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--ink-400)' }}>
                    ({targetLang?.name})
                  </span>
                </div>

                {translatedText && (
                  <motion.button
                    onClick={handleCopy}
                    className="btn btn-ghost btn-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" style={{ color: 'var(--success-600)' }} />
                        <span className="text-xs" style={{ color: 'var(--success-600)' }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Content */}
              <div className="h-48 p-4 overflow-y-auto">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <LoadingSpinner />
                      <p className="mt-2 text-sm" style={{ color: 'var(--ink-400)' }}>
                        Translating to {targetLang?.native}...
                      </p>
                    </div>
                  </div>
                ) : translatedText ? (
                  <motion.div 
                    className="prose-content"
                    style={{ 
                      fontFamily: 'system-ui, sans-serif',
                      color: 'var(--ink-200)',
                      lineHeight: 1.7,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {translatedText}
                  </motion.div>
                ) : (
                  <div 
                    className="h-full flex items-center justify-center text-center"
                    style={{ color: 'var(--ink-300)' }}
                  >
                    <div>
                      <Languages className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Translated text will appear here</p>
                      <p className="text-xs mt-1 opacity-70">
                        Enter text and click translate
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with character count */}
              <div 
                className="px-4 py-2"
                style={{ 
                  borderTop: '1px solid var(--teal-100)',
                  backgroundColor: 'rgba(240, 253, 250, 0.5)',
                }}
              >
                <span className="text-xs" style={{ color: 'var(--ink-400)' }}>
                  {translatedText.length} characters
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Voice Input Info */}
        {speech.isSupported && (
          <FadeIn delay={0.1}>
            <div 
              className="mt-4 p-4 rounded-lg flex items-start gap-3"
              style={{ 
                backgroundColor: 'var(--indigo-50)',
                border: '1px solid var(--indigo-200)',
              }}
            >
              <Mic className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--indigo-600)' }} />
              <div>
                <h4 className="text-sm font-medium" style={{ color: 'var(--indigo-800)' }}>
                  Voice-to-Text Available
                </h4>
                <p className="text-xs mt-1" style={{ color: 'var(--indigo-600)' }}>
                  Click the microphone button to speak in {sourceLang?.name}. Your speech will be 
                  automatically converted to text. Supports all 12 languages including regional Indian languages.
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Compact Info */}
        <FadeIn delay={0.2}>
          <div 
            className="mt-4 p-4 rounded-lg"
            style={{ 
              backgroundColor: 'var(--paper-200)',
              border: '1px solid var(--paper-300)',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--ink-500)' }}>
              <strong>Translation:</strong> Powered by Google Translate API. Supports 12 languages including 
              English and 11 major Indian languages. Translate in any direction—Hindi to Tamil, Bengali to 
              Gujarati, or English to any regional language.
            </p>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
