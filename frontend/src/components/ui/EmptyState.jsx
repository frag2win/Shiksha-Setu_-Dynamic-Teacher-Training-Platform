/**
 * Empty State Component
 * Beautiful empty state illustrations for when lists are empty
 */

import { motion } from 'framer-motion';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction 
}) {
  return (
    <motion.div 
      className="text-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <Icon className="w-20 h-20 mx-auto mb-6 text-ink-300 opacity-60" />
      </motion.div>
      
      <h3 className="text-2xl font-semibold text-ink-700 mb-3">
        {title}
      </h3>
      
      <p className="text-ink-500 mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      
      {actionText && onAction && (
        <motion.button
          onClick={onAction}
          className="btn-primary px-6 py-3 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
}
