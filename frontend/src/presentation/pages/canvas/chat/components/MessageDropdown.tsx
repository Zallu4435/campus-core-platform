import React, { useRef, useEffect } from 'react';
import { FiSmile, FiCornerUpLeft, FiEdit2, FiTrash2, FiDownload } from 'react-icons/fi';
import { MessageDropdownProps } from '../../../../../domain/types/canvas/chat';

export const MessageDropdown: React.FC<MessageDropdownProps> = ({
  message,
  currentUserId,
  isVisible,
  onClose,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onShowDeleteOptions
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const isSentMessage = message.senderId === currentUserId;

  return (
    <div
      ref={menuRef}
      className={`absolute top-8 ${isSentMessage ? 'right-0' : 'left-0'} bg-white dark:bg-[#202c33] rounded-lg shadow-lg py-1 z-10 w-48 border border-gray-200 dark:border-gray-600`}
    >
      <button
        onClick={() => {
          onReact();
          onClose();
        }}
        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3942] w-full text-left"
      >
        <FiSmile className="w-4 h-4 mr-3" />
        React
      </button>

      <button
        onClick={() => {
          onReply();
          onClose();
        }}
        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3942] w-full text-left"
      >
        <FiCornerUpLeft className="w-4 h-4 mr-3" />
        Reply
      </button>

      {isSentMessage && message.type === 'text' && (Date.now() - new Date(message.createdAt).getTime()) < 24 * 60 * 60 * 1000 && (
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3942] w-full text-left"
        >
          <FiEdit2 className="w-4 h-4 mr-3" />
          Edit
        </button>
      )}

      {isSentMessage ? (
        <button
          onClick={onShowDeleteOptions}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-[#2a3942] w-full text-left"
        >
          <FiTrash2 className="w-4 h-4 mr-3" />
          Delete
        </button>
      ) : (
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-[#2a3942] w-full text-left"
        >
          <FiTrash2 className="w-4 h-4 mr-3" />
          Delete for me
        </button>
      )}

      {message.attachments && message.attachments.length > 0 && (
        <a
          href={message.attachments[0].url}
          download={message.attachments[0].name}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3942] w-full text-left"
        >
          <FiDownload className="w-4 h-4 mr-3" />
          Download
        </a>
      )}
    </div>
  );
};