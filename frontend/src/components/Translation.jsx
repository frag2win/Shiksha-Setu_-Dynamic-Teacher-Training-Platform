import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  Globe, Languages, Zap, FileText, ArrowRightLeft, X, 
  Copy, Share2, AlertCircle, Clock, History, Mic, MicOff
} from 'lucide-react';

const Translation = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('english');
  const [targetLanguage, setTargetLanguage] = useState('hindi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const languages = [
    { code: 'english', name: 'English', native: 'English', region: 'EN' },
    { code: 'hindi', name: 'Hindi', native: 'हिंदी', region: 'HI' },
    { code: 'marathi', name: 'Marathi', native: 'मराठी', region: 'MR' },
    { code: 'bengali', name: 'Bengali', native: 'বাংলা', region: 'BN' },
    { code: 'tamil', name: 'Tamil', native: 'தமிழ்', region: 'TA' },
    { code: 'telugu', name: 'Telugu', native: 'తెలుగు', region: 'TE' },
    { code: 'gujarati', name: 'Gujarati', native: 'ગુજરાતી', region: 'GU' },
    { code: 'kannada', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'KN' },
    { code: 'malayalam', name: 'Malayalam', native: 'മലയാളം', region: 'ML' },
    { code: 'punjabi', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'PA' },
    { code: 'odia', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'OR' },
    { code: 'urdu', name: 'Urdu', native: 'اردو', region: 'UR' },
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setError('Source and target languages must be different');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await api.translate(inputText, targetLanguage, sourceLanguage);
      setTranslatedText(result.translated_text);
      
      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        source: inputText,
        translated: result.translated_text,
        from: sourceLanguage,
        to: targetLanguage,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err.message || 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
    }
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getLanguageName = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  const getLanguageNative = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.native : code;
  };

  // Speech Recognition Language Mapping
  const speechLangMap = {
    'english': 'en-US',
    'hindi': 'hi-IN',
    'marathi': 'mr-IN',
    'bengali': 'bn-IN',
    'tamil': 'ta-IN',
    'telugu': 'te-IN',
    'gujarati': 'gu-IN',
    'kannada': 'kn-IN',
    'malayalam': 'ml-IN',
    'punjabi': 'pa-IN',
    'odia': 'or-IN',
    'urdu': 'ur-IN'
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputText(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone permissions.');
        }
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

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = speechLangMap[sourceLanguage] || 'en-US';
      recognitionRef.current.start();
      setIsListening(true);
      setError('');
    }
  };

  const quickPhrases = [
    "Good morning, students!",
    "Please open your textbooks to page 10.",
    "Today we will learn about fractions.",
    "Can anyone tell me the answer?",
    "Very good! Well done!",
    "Please raise your hand if you have a question.",
  ];

  return (
    <div className="translation-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Translation Center</h1>
          <p className="page-subtitle">
            Translate training content into 12 Indian languages instantly
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon"><AlertCircle size={20} /></span>
          <div className="alert-content">{error}</div>
        </div>
      )}

      {/* Language Stats */}
      <div className="language-stats">
        <div className="language-stat">
          <span className="stat-icon"><Globe size={24} /></span>
          <span className="stat-value">12</span>
          <span className="stat-label">Languages</span>
        </div>
        <div className="language-stat">
          <span className="stat-icon"><Languages size={24} /></span>
          <span className="stat-value">11</span>
          <span className="stat-label">Indian Languages</span>
        </div>
        <div className="language-stat">
          <span className="stat-icon"><Zap size={24} /></span>
          <span className="stat-value">&lt;1s</span>
          <span className="stat-label">Avg. Speed</span>
        </div>
        <div className="language-stat">
          <span className="stat-icon"><FileText size={24} /></span>
          <span className="stat-value">{history.length}</span>
          <span className="stat-label">Translations</span>
        </div>
      </div>

      <div className="translation-container">
        {/* Main Translation Panel */}
        <div className="translation-panel">
          {/* Horizontal Language Bar - Google Translate Style */}
          <div className="language-bar-horizontal">
            <div className="lang-select-horizontal">
              <select
                className="language-select-horizontal"
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="swap-btn-horizontal" onClick={swapLanguages} title="Swap languages">
              <ArrowRightLeft size={22} />
            </button>

            <div className="lang-select-horizontal">
              <select
                className="language-select-horizontal"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="translation-boxes">
            <div className="translation-box source">
              <textarea
                className="translation-textarea"
                placeholder="Enter text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onBlur={handleTranslate}
                maxLength={5000}
              />
              <div className="box-footer">
                <div className="footer-left">
                  <button 
                    className={`action-btn-simple voice-btn ${isListening ? 'listening' : ''}`}
                    onClick={toggleVoiceInput}
                    title={isListening ? 'Stop recording' : 'Voice input'}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <button 
                    className="action-btn-simple"
                    onClick={() => setInputText('')}
                    disabled={!inputText}
                    title="Clear"
                  >
                    <X size={16} />
                  </button>
                  <span className="char-count">{inputText.length} / 5000</span>
                </div>
                <div className="footer-right">
                  <button 
                    className="translate-btn"
                    onClick={handleTranslate}
                    disabled={!inputText || loading}
                    title="Translate"
                  >
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages size={18} />
                        Translate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="translation-box target">
              <div className="translation-output">
                {loading ? (
                  <div className="loading-placeholder">
                    <div className="loading-spinner"></div>
                  </div>
                ) : translatedText ? (
                  <p className="translated-text">{translatedText}</p>
                ) : (
                  <p className="placeholder-text">Translation</p>
                )}
              </div>
              {translatedText && (
                <div className="box-footer">
                  <div className="action-btns-group">
                    <button 
                      className="action-btn-simple"
                      onClick={() => copyToClipboard(translatedText)}
                      title="Copy"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      className="action-btn-simple"
                      onClick={() => {/* Share functionality */}}
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="translation-sidebar">
          {/* Quick Phrases */}
          <div className="sidebar-card">
            <h3><Zap size={18} /> Quick Phrases</h3>
            <p className="sidebar-hint">Click to use common classroom phrases</p>
            <div className="quick-phrases">
              {quickPhrases.map((phrase, index) => (
                <button
                  key={index}
                  className="phrase-btn"
                  onClick={() => setInputText(phrase)}
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* Supported Languages */}
          <div className="sidebar-card">
            <h3><Globe size={18} /> Supported Languages</h3>
            <div className="language-grid">
              {languages.slice(1).map((lang) => (
                <div 
                  key={lang.code} 
                  className={`language-chip ${targetLanguage === lang.code ? 'active' : ''}`}
                  onClick={() => setTargetLanguage(lang.code)}
                >
                  <span className="lang-code">{lang.region}</span>
                  <span className="lang-native">{lang.native}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent History */}
          {history.length > 0 && (
            <div className="sidebar-card">
              <h3><History size={18} /> Recent Translations</h3>
              <div className="history-list">
                {history.slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    className="history-item"
                    onClick={() => {
                      setInputText(item.source);
                      setTranslatedText(item.translated);
                      setSourceLanguage(item.from);
                      setTargetLanguage(item.to);
                    }}
                  >
                    <div className="history-text">{item.source.substring(0, 50)}...</div>
                    <div className="history-meta">
                      {getLanguageName(item.from)} → {getLanguageName(item.to)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .translation-page {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          margin-bottom: 28px;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        /* Stats Cards */
        .language-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        @media (max-width: 900px) {
          .language-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .language-stat {
          background: var(--bg-elevated);
          border-radius: var(--radius-lg);
          padding: 20px;
          text-align: center;
          border: 1px solid var(--glass-border);
          transition: all 0.2s ease;
        }

        .language-stat:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .language-stat .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          margin: 0 auto 12px;
          color: var(--primary-violet);
        }

        .language-stat .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
          margin-bottom: 4px;
        }

        .language-stat .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Main Container */
        .translation-container {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1100px) {
          .translation-container {
            grid-template-columns: 1fr;
          }
        }

        /* Translation Panel */
        .translation-panel {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: 0;
          border: 1px solid var(--glass-border);
          overflow: hidden;
        }

        /* Horizontal Language Bar - Google Translate Style */
        .language-bar-horizontal {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 0;
          background: transparent;
          border-radius: 0;
          border: none;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 0;
        }

        .lang-select-horizontal {
          flex: 1;
        }

        .language-select-horizontal {
          width: 100%;
          padding: 16px 20px;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          border-radius: 0;
          background: transparent;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          appearance: none;
          background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="%23666" d="M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z"/></svg>');
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
        }

        .language-select-horizontal:hover {
          background: var(--bg-hover);
        }

        .language-select-horizontal:focus {
          outline: none;
          background: var(--bg-hover);
        }

        .language-select-horizontal option {
          background: var(--bg-elevated);
          color: var(--text-primary);
          padding: 10px;
        }

        .swap-btn-horizontal {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border: none;
          border-left: 1px solid var(--glass-border);
          border-right: 1px solid var(--glass-border);
          border-radius: 0;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .swap-btn-horizontal:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        /* Old Language Selector - Removed */
        .language-selector {
          display: none;
        }

        .language-select-group {
          display: none;
        }

        .language-select {
          display: none;
        }

        .swap-btn {
          display: none;
        }

        /* Translation Boxes */
        .translation-boxes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          margin-bottom: 0;
          border: 1px solid var(--glass-border);
          border-top: none;
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .translation-boxes {
            grid-template-columns: 1fr;
          }
        }

        .translation-box {
          border: none;
          border-radius: 0;
          overflow: visible;
          background: var(--bg-surface);
          display: flex;
          flex-direction: column;
        }

        .translation-box.source {
          border-right: 1px solid var(--glass-border);
        }

        .translation-box.target {
          background: var(--bg-surface);
          border: none;
        }

        .box-header {
          display: none;
        }

        .translation-box.target .box-header {
          display: none;
        }

        .box-label {
          display: none;
        }

        .translating-badge {
          display: none;
        }

        .translation-textarea {
          width: 100%;
          min-height: 300px;
          max-height: 400px;
          padding: 20px;
          border: none;
          font-size: 1rem;
          line-height: 1.6;
          resize: none;
          font-family: inherit;
          background: transparent;
          color: var(--text-primary);
          flex: 1;
        }

        .translation-textarea::placeholder {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .translation-textarea:focus {
          outline: none;
        }

        .translation-output {
          min-height: 300px;
          max-height: 400px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          flex: 1;
          overflow-y: auto;
        }

        .loading-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          min-height: 200px;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--glass-border);
          border-top-color: var(--primary-violet);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .translated-text {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-primary);
          word-break: break-word;
          width: 100%;
        }

        .placeholder-text {
          color: var(--text-muted);
          font-size: 1rem;
          opacity: 0.6;
        }

        .box-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
        }

        .footer-left {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .char-count {
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.8;
        }

        .action-btns-group {
          display: flex;
          gap: 8px;
        }

        .action-btn-simple {
          width: 32px;
          height: 32px;
          padding: 0;
          border: none;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn-simple:hover:not(:disabled) {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .action-btn-simple:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .voice-btn.listening {
          background: var(--primary-violet);
          color: white;
          animation: pulse-mic 1.5s ease-in-out infinite;
        }

        @keyframes pulse-mic {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(91, 95, 199, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(91, 95, 199, 0);
          }
        }

        .footer-right {
          display: flex;
          align-items: center;
        }

        .translate-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 24px;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--primary-violet) 0%, var(--primary-violet-dark, #4a4eb8) 100%);
          color: white;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(91, 95, 199, 0.3);
          min-width: 140px;
        }

        .translate-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(91, 95, 199, 0.4);
          background: linear-gradient(135deg, var(--primary-violet-dark, #4a4eb8) 0%, var(--primary-violet) 100%);
        }

        .translate-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(91, 95, 199, 0.3);
        }

        .translate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-spinner-sm {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        /* Sidebar */
        .translation-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-card {
          background: var(--bg-elevated);
          border-radius: var(--radius-lg);
          padding: 20px;
          border: 1px solid var(--glass-border);
        }

        .sidebar-card h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sidebar-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .quick-phrases {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .phrase-btn {
          padding: 12px 14px;
          font-size: 0.85rem;
          text-align: left;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          line-height: 1.4;
        }

        .phrase-btn:hover {
          background: var(--primary-violet);
          color: white;
          border-color: var(--primary-violet);
          transform: translateX(4px);
        }

        .language-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .language-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .language-chip:hover {
          background: var(--bg-hover);
          border-color: var(--glass-border);
        }

        .language-chip.active {
          background: rgba(91, 95, 199, 0.15);
          border-color: var(--primary-violet);
        }

        .lang-code {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--primary-violet);
          background: rgba(91, 95, 199, 0.1);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .lang-native {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .history-item {
          padding: 12px 14px;
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .history-item:hover {
          background: var(--bg-hover);
          border-color: var(--glass-border);
        }

        .history-text {
          font-size: 0.85rem;
          color: var(--text-primary);
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .history-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Alert Styles */
        .alert {
          padding: 14px 18px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .alert-error {
          background: rgba(185, 28, 28, 0.1);
          border: 1px solid rgba(185, 28, 28, 0.3);
          color: #EF4444;
        }

        .alert-icon {
          flex-shrink: 0;
        }

        .alert-content {
          font-size: 0.9rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default Translation;
