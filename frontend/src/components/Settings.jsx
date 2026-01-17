import React, { useState, useEffect } from 'react';
import { 
  X, Moon, Sun, Palette, Bell, Globe, Shield, Database, 
  Zap, Monitor, Smartphone, Save, RotateCcw, Check,
  ChevronRight, User, Key, Info, Volume2, VolumeX
} from 'lucide-react';

const Settings = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState('appearance');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaultSettings = {
      theme: 'light',
      accentColor: 'violet',
      fontSize: 'medium',
      animations: true,
      soundEffects: false,
      notifications: true,
      autoSave: true,
      language: 'english',
      apiEndpoint: 'http://localhost:8000',
      groqApiKey: '',
      showTour: true,
      compactMode: false
    };
    setLocalSettings(defaultSettings);
  };

  const tabs = [
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'preferences', icon: Zap, label: 'Preferences' },
    { id: 'api', icon: Database, label: 'API Settings' },
    { id: 'about', icon: Info, label: 'About' }
  ];

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor }
  ];

  const accentColors = [
    { id: 'violet', color: '#8B5CF6', name: 'Violet' },
    { id: 'blue', color: '#3B82F6', name: 'Blue' },
    { id: 'green', color: '#10B981', name: 'Emerald' },
    { id: 'orange', color: '#F97316', name: 'Orange' },
    { id: 'pink', color: '#EC4899', name: 'Pink' },
    { id: 'teal', color: '#14B8A6', name: 'Teal' }
  ];

  const languages = [
    { code: 'english', name: 'English' },
    { code: 'hindi', name: 'हिंदी (Hindi)' },
    { code: 'marathi', name: 'मराठी (Marathi)' }
  ];

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-body">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                <ChevronRight size={16} className="tab-arrow" />
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="settings-content">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h3>Theme</h3>
                <div className="theme-options">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      className={`theme-option ${localSettings.theme === theme.id ? 'active' : ''}`}
                      onClick={() => setLocalSettings({...localSettings, theme: theme.id})}
                    >
                      <theme.icon size={24} />
                      <span>{theme.name}</span>
                      {localSettings.theme === theme.id && <Check size={16} className="check-icon" />}
                    </button>
                  ))}
                </div>

                <h3>Accent Color</h3>
                <div className="color-options">
                  {accentColors.map((color) => (
                    <button
                      key={color.id}
                      className={`color-option ${localSettings.accentColor === color.id ? 'active' : ''}`}
                      style={{ '--color': color.color }}
                      onClick={() => setLocalSettings({...localSettings, accentColor: color.id})}
                      title={color.name}
                    >
                      {localSettings.accentColor === color.id && <Check size={14} />}
                    </button>
                  ))}
                </div>

                <h3>Font Size</h3>
                <div className="font-size-options">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      className={`font-option ${localSettings.fontSize === size ? 'active' : ''}`}
                      onClick={() => setLocalSettings({...localSettings, fontSize: size})}
                    >
                      <span style={{ fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px' }}>
                        Aa
                      </span>
                      <span>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                    </button>
                  ))}
                </div>

                <h3>Display</h3>
                <div className="toggle-options">
                  <label className="toggle-option">
                    <div className="toggle-info">
                      <Smartphone size={18} />
                      <div>
                        <span>Compact Mode</span>
                        <small>Reduce spacing for smaller screens</small>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.compactMode}
                      onChange={(e) => setLocalSettings({...localSettings, compactMode: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <label className="toggle-option">
                    <div className="toggle-info">
                      <Zap size={18} />
                      <div>
                        <span>Animations</span>
                        <small>Enable smooth transitions and effects</small>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.animations}
                      onChange={(e) => setLocalSettings({...localSettings, animations: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h3>Interface Language</h3>
                <select
                  className="settings-select"
                  value={localSettings.language}
                  onChange={(e) => setLocalSettings({...localSettings, language: e.target.value})}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>

                <h3>Notifications & Sounds</h3>
                <div className="toggle-options">
                  <label className="toggle-option">
                    <div className="toggle-info">
                      <Bell size={18} />
                      <div>
                        <span>Notifications</span>
                        <small>Show alerts for completed tasks</small>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.notifications}
                      onChange={(e) => setLocalSettings({...localSettings, notifications: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <label className="toggle-option">
                    <div className="toggle-info">
                      {localSettings.soundEffects ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      <div>
                        <span>Sound Effects</span>
                        <small>Play sounds for actions</small>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.soundEffects}
                      onChange={(e) => setLocalSettings({...localSettings, soundEffects: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <label className="toggle-option">
                    <div className="toggle-info">
                      <Save size={18} />
                      <div>
                        <span>Auto-Save</span>
                        <small>Automatically save changes</small>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.autoSave}
                      onChange={(e) => setLocalSettings({...localSettings, autoSave: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <label className="toggle-option">
                    <div className="toggle-info">
                      <Info size={18} />
                      <div>
                        <span>Show Onboarding Tour</span>
                        <small>Display welcome guide for new users</small>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.showTour}
                      onChange={(e) => setLocalSettings({...localSettings, showTour: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* API Settings Tab */}
            {activeTab === 'api' && (
              <div className="settings-section">
                <h3>Backend API</h3>
                <div className="input-group">
                  <label>API Endpoint</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={localSettings.apiEndpoint}
                    onChange={(e) => setLocalSettings({...localSettings, apiEndpoint: e.target.value})}
                    placeholder="http://localhost:8000"
                  />
                  <small>The URL of your Shiksha-Setu backend server</small>
                </div>

                <h3>AI Configuration</h3>
                <div className="input-group">
                  <label>
                    <Key size={14} /> GROQ API Key
                  </label>
                  <input
                    type="password"
                    className="settings-input"
                    value={localSettings.groqApiKey}
                    onChange={(e) => setLocalSettings({...localSettings, groqApiKey: e.target.value})}
                    placeholder="gsk_xxxxxxxxxxxxxxxx"
                  />
                  <small>Required for AI module generation. Get yours at console.groq.com</small>
                </div>

                <div className="api-status">
                  <div className="status-item">
                    <span className="status-dot connected"></span>
                    <span>Backend API</span>
                    <span className="status-value">Connected</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot connected"></span>
                    <span>ChromaDB</span>
                    <span className="status-value">Running</span>
                  </div>
                  <div className="status-item">
                    <span className={`status-dot ${localSettings.groqApiKey ? 'connected' : 'disconnected'}`}></span>
                    <span>GROQ AI</span>
                    <span className="status-value">{localSettings.groqApiKey ? 'Configured' : 'Not Set'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="settings-section about-section">
                <div className="about-logo">
                  <div className="logo-large">🎓</div>
                  <h2>Shiksha-Setu</h2>
                  <p>Dynamic Teacher Training Platform</p>
                  <span className="version-badge">Version 1.0.0</span>
                </div>

                <div className="about-description">
                  <p>
                    Shiksha-Setu bridges the gap between standardized teacher training content 
                    and the diverse needs of schools across India. Using advanced AI, we adapt 
                    training materials for local contexts, languages, and constraints.
                  </p>
                </div>

                <div className="about-features">
                  <div className="feature-item">
                    <Zap size={20} />
                    <div>
                      <strong>AI-Powered Adaptation</strong>
                      <span>Llama 3.3-70B via GROQ</span>
                    </div>
                  </div>
                  <div className="feature-item">
                    <Globe size={20} />
                    <div>
                      <strong>12 Indian Languages</strong>
                      <span>Google Translate API</span>
                    </div>
                  </div>
                  <div className="feature-item">
                    <Database size={20} />
                    <div>
                      <strong>Vector Search</strong>
                      <span>ChromaDB + RAG</span>
                    </div>
                  </div>
                  <div className="feature-item">
                    <Shield size={20} />
                    <div>
                      <strong>Open Source</strong>
                      <span>MIT License</span>
                    </div>
                  </div>
                </div>

                <div className="about-credits">
                  <p>Built with ❤️ for Indian Education</p>
                  <div className="tech-stack">
                    <span>React</span>
                    <span>FastAPI</span>
                    <span>ChromaDB</span>
                    <span>Llama 3.3</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <button className="btn-reset" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
          <div className="footer-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-save" onClick={handleSave}>
              {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
