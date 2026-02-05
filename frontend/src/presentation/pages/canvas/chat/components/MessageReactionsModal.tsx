import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { MessageReactionsModalProps, Reaction } from '../../../../../domain/types/canvas/chat';

export const MessageReactionsModal: React.FC<MessageReactionsModalProps> = ({
  isVisible,
  onClose,
  reactions,
  currentUserId,
  onRemoveReaction,
  position = { x: 0, y: 0 }
}) => {
  const [activeTab, setActiveTab] = useState<'all' | string>('all');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const originalOverflow = window.getComputedStyle(document.body).overflow;
        const originalPosition = window.getComputedStyle(document.body).position;
        const originalWidth = window.getComputedStyle(document.body).width;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('keydown', handleEscape);
          document.body.style.overflow = originalOverflow;
          document.body.style.position = originalPosition;
          document.body.style.width = originalWidth;
        };
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  const totalReactions = reactions.length;
  const reactionTypes = Object.keys(groupedReactions);

  const getFilteredReactions = () => {
    if (activeTab === 'all') {
      return reactions;
    }
    return groupedReactions[activeTab] || [];
  };

  const modalContent = (
    <>
      <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          ref={modalRef}
          className="bg-white dark:bg-[#2a3942] rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden border border-gray-200 dark:border-gray-600 max-h-[80vh]"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reactions
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {totalReactions > 0 && (
            <div className="flex border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'all'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                All {totalReactions}
              </button>
              {reactionTypes.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setActiveTab(emoji)}
                  className={`flex-shrink-0 flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === emoji
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <span className="text-base">{emoji}</span>
                  <span>{groupedReactions[emoji].length}</span>
                </button>
              ))}
            </div>
          )}

          <div className="h-80 overflow-y-auto">
            {totalReactions === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">😊</div>
                <p>No reactions yet</p>
                <p className="text-sm mt-1">Be the first to react!</p>
              </div>
            ) : (
              <div className="p-2">
                {getFilteredReactions().map((reaction, index) => (
                  <div
                    key={`${reaction.userId}-${reaction.emoji}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {(reaction.userName || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {reaction.userId === currentUserId ? 'You' : (reaction.userName || 'Unknown User')}
                        </span>
                        <span className="text-lg">{reaction.emoji}</span>
                      </div>
                    </div>
                    {reaction.userId === currentUserId && (
                      <button
                        onClick={() => onRemoveReaction(reaction.emoji)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div
          ref={modalRef}
          className="bg-white dark:bg-[#2a3942] rounded-lg shadow-xl max-w-xs w-full mx-4 overflow-hidden border border-gray-200 dark:border-gray-600"
          style={{
            position: 'absolute',
            left: Math.min(position.x, window.innerWidth - 400),
            top: Math.min(position.y, window.innerHeight - 400),
            zIndex: 1000
          }}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reactions
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {totalReactions > 0 && (
            <div className="flex border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'all'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                All {totalReactions}
              </button>
              {reactionTypes.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setActiveTab(emoji)}
                  className={`flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === emoji
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <span className="text-base">{emoji}</span>
                  <span>{groupedReactions[emoji].length}</span>
                </button>
              ))}
            </div>
          )}

          <div className="h-80 overflow-y-auto">
            {totalReactions === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">😊</div>
                <p>No reactions yet</p>
                <p className="text-sm mt-1">Be the first to react!</p>
              </div>
            ) : (
              <div className="p-2">
                {getFilteredReactions().map((reaction, index) => (
                  <div
                    key={`${reaction.userId}-${reaction.emoji}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {(reaction.userName || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {reaction.userId === currentUserId ? 'You' : (reaction.userName || 'Unknown User')}
                        </span>
                        <span className="text-lg">{reaction.emoji}</span>
                      </div>
                    </div>
                    {reaction.userId === currentUserId && (
                      <button
                        onClick={() => onRemoveReaction(reaction.emoji)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};
