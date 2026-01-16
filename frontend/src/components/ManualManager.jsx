import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  Upload, FileText, BookOpen, CheckCircle, Clock, 
  Search, Trash2, X, FolderOpen, AlertCircle, File, Calendar
} from 'lucide-react';

const ManualManager = () => {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [indexing, setIndexing] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadManuals();
  }, []);

  const loadManuals = async () => {
    try {
      setLoading(true);
      const data = await api.getManuals();
      setManuals(data);
    } catch (err) {
      setError('Failed to load manuals');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace('.pdf', ''));
      }
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle) {
      setError('Please provide both title and file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      await api.uploadManual(uploadTitle, selectedFile);
      setSuccess('Manual uploaded successfully!');
      setShowUploadModal(false);
      setUploadTitle('');
      setSelectedFile(null);
      loadManuals();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleIndex = async (manual) => {
    try {
      setIndexing({ ...indexing, [manual.id]: true });
      await api.indexManual(manual.id);
      setSuccess(`"${manual.title}" indexed successfully!`);
      loadManuals();
    } catch (err) {
      setError(err.message || 'Indexing failed');
    } finally {
      setIndexing({ ...indexing, [manual.id]: false });
    }
  };

  const handleDelete = async (manual) => {
    if (!window.confirm(`Delete "${manual.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteManual(manual.id);
      setSuccess('Manual deleted successfully!');
      loadManuals();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="manual-manager">
      <div className="page-header">
        <div>
          <h1 className="page-title">Training Manuals</h1>
          <p className="page-subtitle">
            Upload and manage state training PDF manuals for AI processing
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <Upload size={20} /> Upload Manual
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon"><AlertCircle size={20} /></span>
          <div className="alert-content">{error}</div>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon"><CheckCircle size={20} /></span>
          <div className="alert-content">{success}</div>
        </div>
      )}

      {/* Upload Stats */}
      <div className="upload-stats">
        <div className="upload-stat">
          <span className="stat-icon"><BookOpen size={24} /></span>
          <span className="stat-value">{manuals.length}</span>
          <span className="stat-label">Total Manuals</span>
        </div>
        <div className="upload-stat">
          <span className="stat-icon"><CheckCircle size={24} /></span>
          <span className="stat-value">{manuals.filter(m => m.indexed).length}</span>
          <span className="stat-label">Indexed</span>
        </div>
        <div className="upload-stat">
          <span className="stat-icon"><Clock size={24} /></span>
          <span className="stat-value">{manuals.filter(m => !m.indexed).length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="upload-stat">
          <span className="stat-icon"><FileText size={24} /></span>
          <span className="stat-value">{manuals.reduce((sum, m) => sum + (m.total_pages || 0), 0)}</span>
          <span className="stat-label">Total Pages</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading manuals...</p>
        </div>
      ) : manuals.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><BookOpen size={40} /></div>
          <h3 className="empty-state-title">No Manuals Uploaded</h3>
          <p className="empty-state-text">
            Upload your first training manual PDF to start generating personalized content.
          </p>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            Upload First Manual
          </button>
        </div>
      ) : (
        <div className="manuals-grid">
          {manuals.map((manual) => (
            <div key={manual.id} className="manual-card">
              <div className="manual-icon">
                <span className="pdf-icon"><File size={32} /></span>
                {manual.indexed && <span className="indexed-badge"><CheckCircle size={14} /></span>}
              </div>
              
              <div className="manual-content">
                <h3 className="manual-title">{manual.title}</h3>
                <p className="manual-filename">{manual.filename}</p>
                
                <div className="manual-meta">
                  <span className="meta-item">
                    <FileText size={14} /> {manual.total_pages || '?'} pages
                  </span>
                  <span className="meta-item">
                    <Calendar size={14} /> {new Date(manual.upload_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="manual-status">
                  {manual.indexed ? (
                    <span className="badge badge-success"><CheckCircle size={12} /> Indexed & Ready</span>
                  ) : (
                    <span className="badge badge-warning"><Clock size={12} /> Needs Indexing</span>
                  )}
                </div>
              </div>

              <div className="manual-actions">
                {!manual.indexed && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleIndex(manual)}
                    disabled={indexing[manual.id]}
                  >
                    {indexing[manual.id] ? (
                      <>
                        <span className="loading-spinner-sm"></span>
                        Indexing...
                      </>
                    ) : (
                      <><Search size={16} /> Index Now</>
                    )}
                  </button>
                )}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleDelete(manual)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title"><Upload size={20} /> Upload Training Manual</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Manual Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., NCF 2023 Teacher Training Manual"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    PDF File <span className="required">*</span>
                  </label>
                  
                  <div
                    className={`file-upload ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="file-upload-input"
                      accept=".pdf"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                    
                    {selectedFile ? (
                      <div className="selected-file">
                        <span className="file-icon"><File size={24} /></span>
                        <div className="file-info">
                          <span className="file-name">{selectedFile.name}</span>
                          <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                        </div>
                        <button 
                          type="button"
                          className="remove-file"
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="file-upload-icon"><FolderOpen size={48} /></div>
                        <p className="file-upload-text">
                          Drag & drop your PDF here, or click to browse
                        </p>
                        <p className="file-upload-hint">
                          Maximum file size: 50MB • PDF files only
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="upload-info">
                  <h4>📋 What happens next?</h4>
                  <ol>
                    <li>Your PDF will be uploaded and saved securely</li>
                    <li>Click "Index Now" to process the PDF for AI search</li>
                    <li>Indexed manuals can be used to generate adapted modules</li>
                  </ol>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <>
                      <span className="loading-spinner-sm"></span>
                      Uploading...
                    </>
                  ) : (
                    <>📤 Upload Manual</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .manual-manager {
          animation: fadeIn 0.3s ease;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .upload-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .upload-stat {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: 16px;
          text-align: center;
          border: 1px solid var(--glass-border);
        }

        .upload-stat .stat-icon {
          font-size: 1.25rem;
          display: block;
          margin-bottom: 6px;
        }

        .upload-stat .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
        }

        .upload-stat .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 32px;
        }

        .manuals-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .manual-card {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid var(--glass-border);
          transition: all var(--transition-fast);
        }

        .manual-card:hover {
          background: var(--bg-surface);
          border-color: var(--glass-border-light);
        }

        .manual-icon {
          position: relative;
          width: 48px;
          height: 60px;
          background: #DC2626;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pdf-icon {
          font-size: 1.5rem;
          filter: brightness(0) invert(1);
        }

        .indexed-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: var(--accent-green);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          box-shadow: var(--shadow-md);
        }

        .manual-content {
          flex: 1;
        }

        .manual-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .manual-filename {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .manual-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
        }

        .meta-item {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .manual-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .loading-spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        .modal-lg {
          max-width: 700px;
        }

        .selected-file {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .file-icon {
          font-size: 2.5rem;
        }

        .file-info {
          flex: 1;
        }

        .file-name {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
        }

        .file-size {
          display: block;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .remove-file {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: var(--accent-red);
          color: white;
          cursor: pointer;
          font-size: 1rem;
        }

        .file-upload.has-file {
          border-style: solid;
          border-color: var(--accent-green);
          background: rgba(56, 161, 105, 0.05);
        }

        .upload-info {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-top: 24px;
        }

        .upload-info h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .upload-info ol {
          margin: 0;
          padding-left: 24px;
          color: var(--text-secondary);
        }

        .upload-info li {
          margin-bottom: 8px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default ManualManager;
