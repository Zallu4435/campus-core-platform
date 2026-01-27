import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DeleteMessageModalProps } from '../../../../../domain/types/canvas/chat';

export const DeleteMessageModal: React.FC<DeleteMessageModalProps> = ({
  isVisible,
  isSentMessage,
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = React.useState(false);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      // Trigger animation next frame
      requestAnimationFrame(() => setAnimate(true));
    } else {
      setAnimate(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Handle closing with animation
  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 200); // Wait for animation
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-colors duration-200 ${animate ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
        }`}
    >
      <div
        ref={modalRef}
        className={`
          bg-white dark:bg-[#202c33] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden
          transform transition-all duration-200 ease-out
          ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
        `}
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Delete Message?</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Are you sure you want to delete this message? This action cannot be undone.
          </p>

          <div className="flex flex-col gap-3">
            {isSentMessage && onDeleteForEveryone && (
              <button
                onClick={() => {
                  onDeleteForEveryone();
                  onClose();
                }}
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium transition-colors"
              >
                Delete for everyone
              </button>
            )}

            <button
              onClick={() => {
                onDeleteForMe();
                onClose();
              }}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-colors ${isSentMessage && onDeleteForEveryone
                  ? 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
            >
              Delete for me
            </button>

            <button
              onClick={handleClose}
              className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a3942] transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};