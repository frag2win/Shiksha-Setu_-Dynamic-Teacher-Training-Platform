/**
 * Progress Indicator Component
 * Shows progress for AI generation with animated bar
 */

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function ProgressIndicator({ progress, message }) {
  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="w-full bg-ink-800 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-setu-400 to-setu-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Message with icon */}
      <div className="flex items-center gap-2 text-ink-300">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-4 h-4 text-setu-400" />
        </motion.div>
        <span className="text-sm">{message}</span>
      </div>

      {/* Percentage */}
      <div className="text-right">
        <span className="text-2xl font-bold text-setu-400">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
