/**
 * Shared UI Components
 * Reusable components for the book-like interface
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { overlayVariants, modalVariants } from './PageTransition';

// ================== MODAL ==================
export function Modal({ isOpen, onClose, title, children, size = 'default', icon: Icon }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {Icon && <Icon className="w-5 h-5" style={{ color: 'var(--setu-500)' }} />}
                {title}
              </h2>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-icon"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ================== ALERT ==================
export function Alert({ type = 'info', children, onDismiss }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`alert alert-${type}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="btn btn-ghost btn-icon p-1">
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

// ================== SKELETON LOADER ==================
export function Skeleton({ type = 'text', count = 1, className = '' }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((i) => (
        <div
          key={i}
          className={type === 'heading' ? 'skeleton-heading' : 'skeleton-text'}
          style={{ width: type === 'text' ? `${70 + Math.random() * 30}%` : undefined }}
        />
      ))}
    </div>
  );
}

// ================== EMPTY STATE ==================
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon className="w-full h-full" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{description}</p>
      {action}
    </div>
  );
}

// ================== STAT CARD ==================
export function StatCard({ icon: Icon, value, label, loading }) {
  return (
    <div className="stat-card">
      {Icon && (
        <div className="stat-icon">
          <Icon className="w-6 h-6" />
        </div>
      )}
      {loading ? (
        <div className="skeleton w-12 h-8 mb-1" />
      ) : (
        <div className="stat-value">{value}</div>
      )}
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ================== BADGE ==================
export function Badge({ variant = 'default', children, icon: Icon }) {
  return (
    <span className={`badge badge-${variant}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

// ================== CONFIRM DIALOG ==================
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} icon={AlertTriangle}>
      <div className="modal-body">
        <p style={{ color: 'var(--ink-400)' }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-secondary">
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`btn btn-${variant}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

// ================== LOADING SPINNER ==================
export function LoadingSpinner({ size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ================== PAGE HEADER ==================
export function PageHeader({ title, subtitle, pageNumber, action }) {
  return (
    <div className="page-header">
      <div className="flex items-start justify-between gap-4">
        <div>
          {pageNumber && (
            <p className="page-number mb-2">Page {pageNumber}</p>
          )}
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
