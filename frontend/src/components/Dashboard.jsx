import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { GuideTooltip } from './GuideTooltip';
import { 
  Upload, Building2, Zap, Globe, BookOpen, FileText, 
  Target, ArrowRight, Bot, CheckCircle, TrendingUp, Clock,
  GraduationCap, Award, Users, Lightbulb, Heart, Star,
  Sparkles, BookMarked, PenTool
} from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    clusters: 0,
    manuals: 0,
    modules: 0,
    languages: 12
  });
  const [recentModules, setRecentModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [clusters, manuals, modules] = await Promise.all([
        api.getClusters(),
        api.getManuals(),
        api.getModules()
      ]);
      
      setStats({
        clusters: clusters.length,
        manuals: manuals.length,
        modules: modules.length,
        languages: 12
      });
      
      setRecentModules(modules.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Upload,
      title: 'Upload Manual',
      description: 'Upload a new training PDF',
      action: () => onNavigate('manuals'),
      color: 'primary'
    },
    {
      icon: Building2,
      title: 'Create Cluster',
      description: 'Define a new cluster profile',
      action: () => onNavigate('clusters'),
      color: 'blue'
    },
    {
      icon: Zap,
      title: 'Generate Module',
      description: 'Create adapted content',
      action: () => onNavigate('generate'),
      color: 'green'
    },
    {
      icon: Globe,
      title: 'Translate Text',
      description: 'Translate to Indian languages',
      action: () => onNavigate('translation'),
      color: 'purple'
    }
  ];

  return (
    <div className="dashboard">
      {/* Welcome Section with Teacher-Friendly Design */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-greeting">
            <GraduationCap size={28} className="welcome-icon" />
            <span className="greeting-time">Welcome back, Educator!</span>
          </div>
          <h1>Shiksha-Setu</h1>
          <p>Empowering teachers with personalized training content. Transform standardized materials into engaging, region-specific learning experiences.</p>
          <div className="welcome-features">
            <span><Lightbulb size={14} /> AI-Powered</span>
            <span><Globe size={14} /> Multi-Language</span>
            <span><Users size={14} /> Cluster-Based</span>
          </div>
        </div>
        <div className="welcome-visual">
          <div className="teacher-illustration">
            <div className="illustration-circle">
              <BookMarked size={48} />
            </div>
            <div className="illustration-badge">
              <Award size={20} />
              <span>{stats.modules}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="teacher-quote">
        <Heart size={16} className="quote-icon" />
        <p>"The best teachers teach from the heart, not from the book."</p>
        <span>— Unknown</span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Building2 size={28} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.clusters}</div>
            <div className="stat-label">Cluster Profiles</div>
            <div className="stat-change positive"><TrendingUp size={14} /> Active clusters</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon blue"><BookOpen size={28} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.manuals}</div>
            <div className="stat-label">Training Manuals</div>
            <div className="stat-change positive"><TrendingUp size={14} /> Indexed documents</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green"><FileText size={28} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.modules}</div>
            <div className="stat-label">Generated Modules</div>
            <div className="stat-change positive"><TrendingUp size={14} /> AI-adapted content</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon purple"><Globe size={28} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.languages}</div>
            <div className="stat-label">Languages Supported</div>
            <div className="stat-change positive"><TrendingUp size={14} /> Indian languages</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className={`quick-action-card ${action.color}`}
              onClick={action.action}
            >
              <div className="quick-action-icon"><action.icon size={28} /></div>
              <div className="quick-action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <div className="quick-action-arrow"><ArrowRight size={20} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="section">
        <h2 className="section-title">How Shiksha-Setu Works</h2>
        <div className="workflow-steps">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <div className="step-icon"><Upload size={32} /></div>
            <h3>Upload Manuals</h3>
            <p>Upload state training PDF manuals for AI processing and <GuideTooltip term="Indexing" /></p>
          </div>
          <div className="workflow-connector"><ArrowRight size={24} /></div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <div className="step-icon"><Building2 size={32} /></div>
            <h3>Define <GuideTooltip term="Cluster" />s</h3>
            <p>Create <GuideTooltip term="Cluster" /> profiles with specific constraints and requirements</p>
          </div>
          <div className="workflow-connector"><ArrowRight size={24} /></div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <div className="step-icon"><Bot size={32} /></div>
            <h3>AI <GuideTooltip term="Adaptation" /></h3>
            <p><GuideTooltip term="Llama" /> 3.3 uses <GuideTooltip term="RAG" /> to rewrite content for each cluster's unique needs</p>
          </div>
          <div className="workflow-connector"><ArrowRight size={24} /></div>
          <div className="workflow-step">
            <div className="step-number">4</div>
            <div className="step-icon"><CheckCircle size={32} /></div>
            <h3>Review & Share</h3>
            <p>Approve and distribute personalized <GuideTooltip term="Module" />s to teachers</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentModules.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Modules</h2>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('modules')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Module Title</th>
                    <th>Cluster</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentModules.map((module) => (
                    <tr key={module.id}>
                      <td><strong>{module.title}</strong></td>
                      <td>{module.cluster_id}</td>
                      <td>
                        <span className={`badge ${module.approved ? 'badge-success' : 'badge-warning'}`}>
                          {module.approved ? <><CheckCircle size={14} /> Approved</> : <><Clock size={14} /> Pending</>}
                        </span>
                      </td>
                      <td>{new Date(module.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .welcome-banner {
          background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%);
          color: var(--text-primary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
          padding: 32px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .welcome-banner::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 100%;
          background: linear-gradient(135deg, transparent 0%, rgba(91, 95, 199, 0.05) 100%);
          border-radius: 50% 0 0 50%;
        }

        .welcome-greeting {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .welcome-icon {
          color: var(--primary-violet);
        }

        .greeting-time {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .welcome-content h1 {
          font-size: 1.75rem;
          margin-bottom: 10px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .welcome-content p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          max-width: 480px;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .welcome-features {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .welcome-features span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: var(--bg-surface);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          border: 1px solid var(--glass-border);
        }

        .welcome-visual {
          position: relative;
          z-index: 1;
        }

        .teacher-illustration {
          position: relative;
        }

        .illustration-circle {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, var(--primary-violet) 0%, #0D9488 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 32px rgba(91, 95, 199, 0.3);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .illustration-badge {
          position: absolute;
          bottom: -8px;
          right: -8px;
          background: var(--teacher-gold);
          color: white;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(202, 138, 4, 0.3);
        }

        .teacher-quote {
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-left: 3px solid var(--teacher-gold);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quote-icon {
          color: var(--accent-pink);
          flex-shrink: 0;
        }

        .teacher-quote p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-style: italic;
          flex: 1;
        }

        .teacher-quote span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .section {
          margin-bottom: 28px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title::before {
          content: '';
          width: 4px;
          height: 18px;
          background: var(--primary-violet);
          border-radius: 2px;
        }

        .section-header .section-title {
          margin-bottom: 0;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }

        .quick-action-card {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1px solid var(--glass-border);
          position: relative;
          overflow: hidden;
        }

        .quick-action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--primary-violet);
          transform: scaleY(0);
          transition: transform 0.25s ease;
        }

        .quick-action-card:hover::before {
          transform: scaleY(1);
        }

        .quick-action-card:hover {
          border-color: var(--glass-border-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          background: var(--bg-surface);
        }

        .quick-action-card.primary .quick-action-icon { color: var(--primary-violet); }
        .quick-action-card.blue .quick-action-icon { color: var(--accent-cyan); }
        .quick-action-card.green .quick-action-icon { color: var(--accent-emerald); }
        .quick-action-card.purple .quick-action-icon { color: var(--accent-pink); }

        .quick-action-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          color: var(--primary-violet);
          flex-shrink: 0;
          transition: all 0.25s ease;
        }

        .quick-action-card:hover .quick-action-icon {
          transform: scale(1.1);
        }

        .quick-action-content {
          flex: 1;
        }

        .quick-action-content h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-primary);
        }

        .quick-action-content p {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .quick-action-arrow {
          color: var(--text-muted);
          transition: all 0.25s ease;
          opacity: 0;
        }

        .quick-action-card:hover .quick-action-arrow {
          transform: translateX(4px);
          color: var(--primary-violet);
          opacity: 1;
        }

        .workflow-steps {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0;
          flex-wrap: wrap;
          background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: 28px;
        }

        .workflow-step {
          text-align: center;
          padding: 16px;
          flex: 1;
          min-width: 160px;
          position: relative;
          transition: all 0.25s ease;
        }

        .workflow-step:hover {
          transform: translateY(-4px);
        }

        .step-number {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, var(--primary-violet) 0%, #0D9488 100%);
          color: white;
          border-radius: 50%;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(91, 95, 199, 0.3);
        }

        .step-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 12px;
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-violet);
          transition: all 0.25s ease;
        }

        .workflow-step:hover .step-icon {
          transform: scale(1.1);
          background: var(--primary-violet);
          color: white;
        }

        .workflow-step h3 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-primary);
        }

        .workflow-step p {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .workflow-connector {
          font-size: 1.5rem;
          color: var(--primary-violet);
          padding: 50px 12px 0;
          opacity: 0.5;
        }

        @media (max-width: 900px) {
          .workflow-connector {
            display: none;
          }

          .welcome-banner {
            flex-direction: column;
            gap: 24px;
            text-align: center;
            padding: 24px;
          }

          .welcome-content p {
            max-width: 100%;
          }

          .welcome-features {
            justify-content: center;
          }

          .teacher-quote {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
