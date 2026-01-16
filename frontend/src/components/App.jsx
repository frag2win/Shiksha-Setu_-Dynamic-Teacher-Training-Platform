import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/main.css';
import Dashboard from './Dashboard';
import ClusterManager from './ClusterManager';
import ManualManager from './ManualManager';
import ModuleGenerator from './ModuleGenerator';
import Translation from './Translation';
import Settings from './Settings';
import { GuideTooltip, OnboardingTour, FloatingHelp } from './GuideTooltip';
import api from '../services/api';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Sparkles, 
  Globe,
  Bell,
  Settings as SettingsIcon,
  Search,
  GraduationCap,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  X,
  ChevronUp,
  Command,
  ArrowRight,
  HelpCircle,
  Moon,
  Sun,
  GripHorizontal,
  Minimize2,
  Maximize2
} from 'lucide-react';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState('checking');
  const [showSettings, setShowSettings] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dockExpanded, setDockExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New module generated successfully', time: '2m ago', read: false },
    { id: 2, text: 'Cluster profile updated', time: '1h ago', read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Dock dragging and visibility state
  const [dockVisible, setDockVisible] = useState(true);
  const [dockPosition, setDockPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dockRef = useRef(null);

  // Handle dock dragging
  const handleMouseDown = useCallback((e) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && dockRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep dock within viewport bounds
      const dockWidth = dockRef.current.offsetWidth;
      const dockHeight = dockRef.current.offsetHeight;
      const maxX = window.innerWidth - dockWidth;
      const maxY = window.innerHeight - dockHeight;
      
      setDockPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000);
    
    // Check if first visit
    const hasVisited = localStorage.getItem('shiksha_visited');
    if (!hasVisited) {
      setTimeout(() => setShowTour(true), 1000);
      localStorage.setItem('shiksha_visited', 'true');
    }
    
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowSettings(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await api.checkHealth();
      setApiStatus(response.status === 'healthy' ? 'connected' : 'disconnected');
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  const dockItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#5B5FC7' },
    { id: 'clusters', icon: Users, label: 'Clusters', color: '#0E7490' },
    { id: 'manuals', icon: BookOpen, label: 'Manuals', color: '#047857' },
    { id: 'generate', icon: Sparkles, label: 'AI Generate', color: '#CA8A04' },
    { id: 'translation', icon: Globe, label: 'Translation', color: '#BE185D' },
  ];

  const searchableItems = [
    { id: 'dashboard', label: 'Dashboard', description: 'View analytics and overview', icon: LayoutDashboard },
    { id: 'clusters', label: 'Cluster Profiles', description: 'Manage teacher clusters', icon: Users },
    { id: 'manuals', label: 'Training Manuals', description: 'Upload and process manuals', icon: BookOpen },
    { id: 'generate', label: 'AI Module Generator', description: 'Generate adaptive content', icon: Sparkles },
    { id: 'translation', label: 'Translation Center', description: 'Translate content', icon: Globe },
    { id: 'settings', label: 'Settings', description: 'App preferences', icon: SettingsIcon, action: () => setShowSettings(true) },
  ];

  const filteredSearchItems = searchableItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'clusters':
        return <ClusterManager />;
      case 'manuals':
        return <ManualManager />;
      case 'generate':
      case 'modules':
        return <ModuleGenerator />;
      case 'translation':
        return <Translation />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  const quickStats = [
    { icon: Zap, value: '24', label: 'Active Modules', color: '#5B5FC7' },
    { icon: TrendingUp, value: '89%', label: 'Completion Rate', color: '#047857' },
    { icon: Clock, value: '3.2h', label: 'Avg. Training', color: '#CA8A04' },
    { icon: CheckCircle2, value: '156', label: 'Teachers Trained', color: '#0E7490' },
  ];

  const pageDescriptions = {
    dashboard: 'Welcome back! Here\'s your training overview.',
    clusters: 'Manage and organize teacher clusters by region.',
    manuals: 'Upload and process training materials.',
    generate: 'Create AI-powered adaptive training modules.',
    translation: 'Translate content to regional languages.'
  };

  return (
    <div className={`app-wrapper immersive ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="bg-gradient"></div>
      </div>

      {/* Top Header Bar - Minimal Glass */}
      <header className="top-header">
        <div className="header-brand">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">Shiksha-Setu</span>
            <span className="brand-tagline">AI Training Platform</span>
          </div>
        </div>

        <div className="header-center">
          <button className="search-trigger" onClick={() => setShowSearch(true)}>
            <Search size={18} />
            <span>Quick Search...</span>
            <kbd>
              <Command size={12} />
              <span>K</span>
            </kbd>
          </button>
        </div>

        <div className="header-actions">
          <div className="connection-pill">
            <div className={`status-indicator ${apiStatus}`}></div>
            <span>{apiStatus === 'connected' ? 'Online' : 'Offline'}</span>
          </div>

          <button 
            className="action-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="notification-wrapper">
            <button 
              className="action-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {notifications.some(n => !n.read) && <span className="notification-dot"></span>}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  <button onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}>
                    Mark all read
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div className="empty-notifications">No notifications</div>
                ) : (
                  notifications.map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.read ? 'read' : ''}`}>
                      <p>{notification.text}</p>
                      <span>{notification.time}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button className="action-btn" onClick={() => setShowSettings(true)} title="Settings">
            <SettingsIcon size={20} />
          </button>

          <div className="user-capsule">
            <div className="user-avatar">DK</div>
            <div className="user-details">
              <span className="user-name">Dr. Kumar</span>
              <span className="user-role">Principal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="main-canvas">
        {/* Quick Stats Sidebar */}
        <aside className="quick-stats">
          <h3>Quick Stats</h3>
          {quickStats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </aside>

        {/* Page Content */}
        <div className="content-area">
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">
                {dockItems.find(i => i.id === currentPage)?.label || 'Dashboard'}
              </h1>
              <p className="page-description">
                {pageDescriptions[currentPage] || 'Welcome to Shiksha-Setu'}
              </p>
            </div>
          </div>

          <div className="page-content">
            {renderPage()}
          </div>
        </div>
      </main>

      {/* Floating Dock Navigation */}
      <nav 
        ref={dockRef}
        className={`floating-dock ${dockExpanded ? 'expanded' : ''} ${dockVisible ? 'dock-visible' : 'dock-hidden'} ${isDragging ? 'dragging' : ''}`}
        onMouseEnter={() => setDockExpanded(true)}
        onMouseLeave={() => setDockExpanded(false)}
        style={dockPosition.x !== null ? {
          left: `${dockPosition.x}px`,
          top: `${dockPosition.y}px`,
          bottom: 'auto',
          transform: 'none'
        } : {}}
      >
        {/* Drag Handle */}
        <div 
          className="dock-drag-handle"
          onMouseDown={handleMouseDown}
          title="Drag to move"
        >
          <GripHorizontal size={16} />
        </div>
        
        <div className="dock-items">
          {dockItems.map((item) => (
            <button
              key={item.id}
              className={`dock-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
              style={{ '--item-color': item.color }}
              title={item.label}
            >
              <div className="dock-icon">
                <item.icon size={22} />
              </div>
              <span className="dock-label">{item.label}</span>
              {currentPage === item.id && <div className="dock-indicator"></div>}
            </button>
          ))}
        </div>
        
        {/* Close Button */}
        <button 
          className="dock-close-btn"
          onClick={() => setDockVisible(false)}
          title="Minimize dock"
        >
          <Minimize2 size={14} />
        </button>
      </nav>

      {/* Dock Reopen Button (when dock is hidden) */}
      {!dockVisible && (
        <button 
          className="dock-reopen-btn"
          onClick={() => setDockVisible(true)}
          title="Open navigation"
        >
          <Maximize2 size={18} />
          <span>Menu</span>
        </button>
      )}

      {/* Search Overlay */}
      {showSearch && (
        <div className="search-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-input-wrapper">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search for pages, actions, or settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button className="close-search" onClick={() => setShowSearch(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="search-results">
              {filteredSearchItems.map((item) => (
                <button
                  key={item.id}
                  className="search-result-item"
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setCurrentPage(item.id);
                    }
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="result-icon">
                    <item.icon size={20} />
                  </div>
                  <div className="result-content">
                    <span className="result-title">{item.label}</span>
                    <span className="result-description">{item.description}</span>
                  </div>
                  <ArrowRight size={16} className="result-arrow" />
                </button>
              ))}
            </div>
            <div className="search-footer">
              <span>Press <kbd>↵</kbd> to select</span>
              <span>Press <kbd>Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}

      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour onComplete={() => setShowTour(false)} />
      )}

      {/* Floating Help Button */}
      <FloatingHelp onStartTour={() => setShowTour(true)} />
    </div>
  );
};

export default App;
