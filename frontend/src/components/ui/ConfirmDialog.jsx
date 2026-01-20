/**
 * Confirmation Dialog Component
 * Beautiful modal for confirming destructive actions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // 'danger' or 'warning'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        {/* Dialog */}
        <motion.div
          className="relative bg-paper-50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-ink-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-ink-400" />
          </button>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                variant === 'danger' 
                  ? 'bg-red-100' 
                  : 'bg-yellow-100'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  variant === 'danger' 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
                }`} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-ink-700 mb-2">
                  {title}
                </h3>
                <p className="text-ink-500 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-ink-200 text-ink-700 font-medium hover:bg-ink-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors ${
                  variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
