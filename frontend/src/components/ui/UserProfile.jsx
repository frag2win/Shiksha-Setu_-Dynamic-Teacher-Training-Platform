/**
 * User Profile Component
 * Displays user avatar, name, role with dropdown menu
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfile({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      principal: 'bg-blue-100 text-blue-700 border-blue-200',
      teacher: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[role] || colors.teacher;
  };

  const handleLogoutClick = () => {
    toast.success('Logged out successfully!');
    setTimeout(() => {
      setIsOpen(false);
      onLogout();
    }, 500);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper-100 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-setu-400 to-setu-600 flex items-center justify-center text-white font-semibold shadow-md">
          {getInitials(user.full_name)}
        </div>
        
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-ink-700">
            {user.full_name}
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full inline-block border ${getRoleBadgeColor(user.role)}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </div>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-ink-400 transition-transform hidden sm:block ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-paper-200 py-2 z-50"
          >
            <div className="px-4 py-3 border-b border-paper-200">
              <div className="font-medium text-ink-700">{user.full_name}</div>
              <div className="text-sm text-ink-500">{user.email}</div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block border mt-2 ${getRoleBadgeColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  toast('Settings feature coming soon!', { icon: '⚙️' });
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-ink-600 hover:bg-paper-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
