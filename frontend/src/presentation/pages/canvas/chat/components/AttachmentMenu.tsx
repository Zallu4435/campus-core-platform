import React, { useEffect, useRef } from 'react';
import { FiFile } from 'react-icons/fi';
import { AttachmentMenuProps } from '../../../../../domain/types/canvas/chat';

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  styles,
  showAttachmentMenu,
  onFileSelect,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (showAttachmentMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttachmentMenu, onClose]);

  if (!showAttachmentMenu) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-0 bottom-full mb-2 shadow-xl rounded-xl border p-4 w-60 max-w-[90vw] bg-white dark:bg-[#202c33] border-gray-200 dark:border-[#2a3942] animate-fadeIn z-30"
      onClick={e => e.stopPropagation()}
    >
      <div className="grid grid-cols-1 gap-1">
        <button
          onClick={() => {
            onFileSelect();
            onClose();
          }}
          className={`flex items-center p-2 ${styles.card.hover} text-white rounded-lg transition-colors`}
        >
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
            <FiFile className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-base font-medium text-gray-900 dark:text-white">File / Media</span>
        </button>
      </div>
    </div>
  );
};