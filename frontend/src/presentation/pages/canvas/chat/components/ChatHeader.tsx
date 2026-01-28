import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiSettings, FiUser, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { ChatHeaderProps } from '../../../../../domain/types/canvas/chat';

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onSettingsClick,
  onDeleteChat,
  onBlock,
  onClearChat,
  currentUserId,
  isBlockedByMe,
  isBlockedMe,
  onBack,
  onlineUsers
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const otherParticipant = chat.type === 'direct'
    ? chat.participants.find(p => (typeof p === 'string' ? p : p.id) !== currentUserId)
    : null;

  const isOnline = chat.type === 'direct'
    ? (otherParticipant ? onlineUsers.has(typeof otherParticipant === 'string' ? otherParticipant : otherParticipant.id) : false)
    : chat.participants.some(p => onlineUsers.has(typeof p === 'string' ? p : p.id));

  const displayName = (chat.type === 'direct' && otherParticipant && typeof otherParticipant !== 'string' && otherParticipant.firstName)
    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
    : chat.name;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#202c33]">
      <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a3942] transition-colors duration-200 flex-shrink-0"
            title="Back to chats"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
          {(() => {
            const effectiveAvatar = chat.avatar || (chat.type === 'direct' ? otherParticipant?.avatar : null);
            if (effectiveAvatar) {
              return (
                <img
                  src={effectiveAvatar}
                  alt={displayName}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                />
              );
            }
            if (chat.type === 'group') {
              return (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FiUsers size={24} className="md:w-7 md:h-7 text-gray-500 dark:text-gray-400" />
                </div>
              );
            }
            return (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <FiUser size={24} className="md:w-7 md:h-7 text-gray-500 dark:text-gray-400" />
              </div>
            );
          })()}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#202c33]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
            {displayName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {chat.type === 'group'
              ? `${chat.participants.length} members`
              : isOnline ? 'Online' : 'Offline'
            }
          </p>
          {isBlockedByMe && (
            <span className="inline-block mt-1 px-1.5 md:px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">Blocked</span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">

        {chat.type === 'group' && (
          <button
            onClick={onSettingsClick}
            className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a3942] transition-colors duration-200"
            title="Group settings"
          >
            <FiSettings className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
        <div className="relative" ref={menuRef}>
          {chat.type === 'direct' && !isBlockedMe && (
            <button
              className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a3942] transition-colors duration-200"
              title="More options"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <FiMoreVertical className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          {menuOpen && chat.type === 'direct' && !isBlockedMe && (
            <div className="absolute right-0 mt-2 w-32 md:w-40 bg-white dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <>
                <button
                  className="w-full text-left px-3 md:px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#2a3942] text-red-600 dark:text-red-400 text-sm"
                  onClick={() => { setMenuOpen(false); onDeleteChat(); }}
                >
                  Delete Chat
                </button>
                <button
                  className="w-full text-left px-3 md:px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#2a3942] text-sm"
                  onClick={() => { setMenuOpen(false); onBlock(); }}
                >
                  {isBlockedByMe ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  className="w-full text-left px-3 md:px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#2a3942] text-sm"
                  onClick={() => { setMenuOpen(false); onClearChat(); }}
                >
                  Clear Chat
                </button>
              </>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};