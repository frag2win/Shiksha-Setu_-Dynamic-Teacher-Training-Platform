/**
 * Manuals Page (Page 2)
 * Upload and manage training PDF manuals - the source of truth
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  Search,
  Trash2,
  File,
  Calendar,
  BookOpen,
  ArrowRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { PageTransition, FadeIn, listContainerVariants, listItemVariants } from '../ui/PageTransition';
import { PageHeader, Modal, Alert, EmptyState, ConfirmDialog, Badge, StatCard, LoadingSpinner } from '../ui/SharedComponents';
import { getManuals, uploadManual, indexManual, deleteManual } from '../../services/api';

export default function ManualsPage() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [indexingIds, setIndexingIds] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [alert, setAlert] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const loadManuals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getManuals();
      setManuals(data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load manuals' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManuals();
  }, [loadManuals]);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace('.pdf', ''));
      }
    } else {
      setAlert({ type: 'error', message: 'Please select a valid PDF file' });
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
    if (!selectedFile || !uploadTitle.trim()) {
      setAlert({ type: 'error', message: 'Please provide both title and file' });
      return;
    }

    setUploading(true);
    setAlert(null);

    try {
      await uploadManual(uploadTitle.trim(), selectedFile);
      setAlert({ type: 'success', message: 'Manual uploaded successfully! Now index it to enable AI search.' });
      setShowUploadModal(false);
      setUploadTitle('');
      setSelectedFile(null);
      loadManuals();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleIndex = async (manual) => {
    setIndexingIds((prev) => new Set([...prev, manual.id]));
    setAlert(null);

    try {
      await indexManual(manual.id);
      setAlert({ type: 'success', message: `"${manual.title}" indexed successfully! It's now ready for AI processing.` });
      loadManuals();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Indexing failed' });
    } finally {
      setIndexingIds((prev) => {
        const next = new Set(prev);
        next.delete(manual.id);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteManual(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Manual deleted successfully!' });
      loadManuals();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to delete manual' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const stats = {
    total: manuals.length,
    indexed: manuals.filter((m) => m.indexed).length,
    pending: manuals.filter((m) => !m.indexed).length,
    totalPages: manuals.reduce((sum, m) => sum + (m.total_pages || 0), 0),
  };

  return (
    <PageTransition>
      <div className="page">
        <PageHeader
          title="Training Manuals"
          subtitle="Upload and manage state training PDF manuals for AI-powered content generation"
          pageNumber="2"
          action={
            <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
              <Upload className="w-4 h-4" />
              Upload Manual
            </button>
          }
        />

        {/* Alerts */}
        <AnimatePresence>
          {alert && (
            <Alert type={alert.type} onDismiss={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}
        </AnimatePresence>

        {/* Info box */}
        <FadeIn className="mb-8">
          <div className="bg-warm-50 border border-warm-200 rounded-page p-4">
            <p className="text-sm text-warm-700">
              <strong>Source of Truth:</strong> Manuals are never altered. The AI reads and adapts 
              content from these documents while preserving the original. After uploading, 
              index each manual to enable intelligent search.
            </p>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1} className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={BookOpen} value={stats.total} label="Total Manuals" loading={loading} />
            <StatCard icon={CheckCircle} value={stats.indexed} label="Indexed" loading={loading} />
            <StatCard icon={Clock} value={stats.pending} label="Pending" loading={loading} />
            <StatCard icon={FileText} value={stats.totalPages} label="Total Pages" loading={loading} />
          </div>
        </FadeIn>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse flex gap-4">
                <div className="skeleton w-16 h-20 rounded" />
                <div className="flex-1">
                  <div className="skeleton-heading mb-3" />
                  <div className="skeleton-text w-1/2 mb-2" />
                  <div className="skeleton-text w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : manuals.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Manuals Uploaded"
            description="Upload your first training manual PDF to start generating AI-adapted content for your teacher clusters."
            action={
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                <Upload className="w-4 h-4" />
                Upload First Manual
              </button>
            }
          />
        ) : (
          <motion.div
            className="grid gap-4 md:grid-cols-2"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {manuals.map((manual, index) => (
              <motion.div
                key={manual.id}
                variants={listItemVariants}
                className="card card-paper group relative overflow-hidden"
                whileHover={{ y: -4, boxShadow: 'var(--shadow-paper-hover)' }}
                style={{ 
                  background: 'var(--gradient-paper)',
                }}
              >
                {/* Accent stripe based on index status */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ 
                    background: manual.indexed 
                      ? 'var(--gradient-setu)' 
                      : 'var(--gradient-warm-spark)' 
                  }}
                />

                <div className="p-6 flex gap-5">
                  {/* Book-like PDF Icon */}
                  <motion.div 
                    className="relative flex-shrink-0"
                    whileHover={{ rotate: -3, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div 
                      className="w-16 h-22 rounded-r-lg flex flex-col items-center justify-center relative"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--warm-100) 0%, var(--paper-200) 100%)',
                        boxShadow: '2px 4px 12px rgba(0,0,0,0.08)',
                        border: '1px solid var(--paper-300)',
                      }}
                    >
                      {/* Book spine effect */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
                        style={{ 
                          background: manual.indexed 
                            ? 'var(--setu-400)' 
                            : 'var(--warm-400)',
                        }}
                      />
                      <File className="w-7 h-7" style={{ color: 'var(--ink-400)' }} />
                      <span 
                        className="text-[10px] mt-1 font-medium"
                        style={{ color: 'var(--ink-500)' }}
                      >
                        PDF
                      </span>
                    </div>
                    {manual.indexed && (
                      <motion.div 
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'var(--success-500)',
                          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-lg font-medium mb-1 truncate transition-colors group-hover:text-setu-700"
                      style={{ color: 'var(--ink-800)' }}
                    >
                      {manual.title}
                    </h3>
                    <p className="text-sm truncate mb-3" style={{ color: 'var(--ink-400)' }}>
                      {manual.filename}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-ink-500 mb-4">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {manual.total_pages || '?'} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(manual.upload_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {manual.indexed ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3" />
                          Indexed & Ready
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <Clock className="w-3 h-3" />
                          Needs Indexing
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center">
                    {!manual.indexed && (
                      <button
                        onClick={() => handleIndex(manual)}
                        className="btn btn-primary btn-sm"
                        disabled={indexingIds.has(manual.id)}
                      >
                        {indexingIds.has(manual.id) ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Indexing...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            Index Now
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(manual)}
                      className="btn btn-outline btn-sm text-danger-500 hover:text-danger-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Next page CTA */}
        {manuals.some((m) => m.indexed) && (
          <FadeIn delay={0.3} className="mt-8 text-center">
            <button
              onClick={() => navigate('/generate')}
              className="btn btn-outline group"
            >
              Continue to Generate Modules
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-ink-400 mt-2">Turn to Page 3</p>
          </FadeIn>
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setUploadTitle('');
            setSelectedFile(null);
          }}
          title="Upload Training Manual"
          icon={Upload}
          size="lg"
        >
          <form onSubmit={handleUpload}>
            <div className="modal-body space-y-5">
              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  Manual Title <span className="form-required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., NCF 2023 Teacher Training Manual"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                />
                <p className="form-hint">A descriptive title for this training manual</p>
              </div>

              {/* File Upload Zone */}
              <div className="form-group">
                <label className="form-label">
                  PDF File <span className="form-required">*</span>
                </label>
                <div
                  className={`file-upload-zone ${dragOver ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-14 bg-paper-200 rounded flex items-center justify-center">
                        <File className="w-6 h-6 text-ink-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-ink-700">{selectedFile.name}</p>
                        <p className="text-sm text-ink-400">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="btn btn-ghost btn-icon ml-auto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-ink-300 mb-3" />
                      <p className="text-ink-600 mb-1">
                        Drop your PDF here or <span className="text-setu-600">browse</span>
                      </p>
                      <p className="text-sm text-ink-400">Only PDF files are accepted</p>
                    </>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="bg-paper-100 rounded-page p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-ink-400 flex-shrink-0" />
                  <div className="text-sm text-ink-500">
                    <p className="mb-1">After uploading, you'll need to index the manual to enable AI search.</p>
                    <p>Indexing extracts and processes the text content for intelligent retrieval.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadTitle('');
                  setSelectedFile(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || !selectedFile || !uploadTitle.trim()}
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Manual
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Manual"
          message={`Are you sure you want to delete "${deleteConfirm?.title}"? This will also remove its indexed content from the AI search.`}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </PageTransition>
  );
}
