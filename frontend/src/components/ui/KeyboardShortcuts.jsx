/**
 * Keyboard Shortcuts Help Component
 * Shows available keyboard shortcuts in a modal
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Keyboard } from 'lucide-react';
import { useState } from 'react';

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Open search' },
  { keys: ['Ctrl', 'N'], description: 'Create new cluster' },
  { keys: ['Ctrl', 'M'], description: 'Generate new module' },
  { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close modal/dialog' },
];

export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  if (!isOpen) return null;

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
          className="relative bg-paper-50 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-ink-100 transition-colors"
            aria-label="Close shortcuts help"
          >
            <X className="w-5 h-5 text-ink-400" />
          </button>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-setu-400 to-setu-600 flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink-700">
                  Keyboard Shortcuts
                </h2>
                <p className="text-sm text-ink-500">Navigate faster with keyboard</p>
              </div>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-ink-50 transition-colors"
                >
                  <span className="text-ink-600">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={i}
                        className="px-2 py-1 text-xs font-semibold rounded bg-ink-100 text-ink-700 border border-ink-200 shadow-sm"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-ink-200">
              <p className="text-xs text-ink-400 text-center">
                Press <kbd className="px-1.5 py-0.5 text-xs rounded bg-ink-100">Ctrl</kbd> +{' '}
                <kbd className="px-1.5 py-0.5 text-xs rounded bg-ink-100">/</kbd> anytime to view shortcuts
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function KeyboardShortcutsButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-setu-500 text-white shadow-lg hover:bg-setu-600 transition-colors z-40"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Ctrl + /)"
      >
        <Keyboard className="w-5 h-5" />
      </button>
      
      <KeyboardShortcutsHelp 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </>
  );
}
