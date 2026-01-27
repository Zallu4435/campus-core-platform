import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiDownload, FiPlus, FiSmile } from 'react-icons/fi';
import { MediaPreviewProps, Message } from '../../../../../domain/types/canvas/chat';

export const MediaPreview: React.FC<MediaPreviewProps> = ({ message, onClose, onAddMore, onRemoveMedia, onSendMedia }) => {
  const [caption, setCaption] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [captions, setCaptions] = useState<string[]>(() => (message.attachments || []).map(() => ''));
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const commonEmojis = ['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = originalStyle;
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [onClose]);

  const mockMessage: Message = {
    id: 'mock-message-1',
    chatId: 'mock-chat-1',
    senderId: 'mock-sender-1',
    senderName: 'Mock User',
    content: '',
    type: 'text',
    status: 'delivered',
    reactions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [
      {
        id: 'mock-1',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
        name: 'cyborg-woman.jpg',
        type: 'image',
        size: 1024,
        mimeType: 'image/jpeg'
      }
    ]
  };

  const currentMessage = message.attachments?.length ? message : mockMessage;

  if (!currentMessage.attachments?.length) return null;

  const attachments = currentMessage.attachments;
  if (!attachments.length || currentMediaIndex < 0 || currentMediaIndex >= attachments.length) return null;
  const attachment = attachments[currentMediaIndex];
  const isImage = attachment.type === 'image';

  useEffect(() => {
    setCaption(captions[currentMediaIndex] || '');
  }, [currentMediaIndex]);

  useEffect(() => {
    if (currentMediaIndex >= attachments.length) {
      setCurrentMediaIndex(Math.max(attachments.length - 1, 0));
    }
  }, [attachments.length]);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCaption(value);
    setCaptions((prev) => {
      const updated = [...prev];
      updated[currentMediaIndex] = value;
      return updated;
    });
  };

  const handleSend = () => {
    if (onSendMedia) {
      onSendMedia(attachments.map((att, idx) => ({ ...att, caption: captions[idx] || '' })));
    } else {
      console.error('Sending media with captions:', captions);
    }
  };

  const handlePrev = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? attachments.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentMediaIndex((prev) => (prev === attachments.length - 1 ? 0 : prev + 1));
  };



  const modalContent = (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div ref={modalRef} className="w-full max-w-4xl h-[80vh] md:h-[80vh] mx-auto bg-black rounded-lg shadow-lg flex flex-col overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-2 md:top-4 left-2 md:left-4 z-50 bg-white/90 hover:bg-white text-black rounded-full p-1.5 md:p-2 shadow-lg transition-colors flex items-center justify-center"
          style={{ fontSize: 28, lineHeight: 1 }}
          title="Close"
        >
          <FiX className="w-4 h-4 md:w-6 md:h-6" />
        </button>



        <div className="flex-1 flex flex-col items-center justify-center bg-black relative">
          <div className="w-full flex items-center justify-center relative" style={{ minHeight: '200px' }}>
            {attachments.length > 1 && (
              <button onClick={handlePrev} className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-60 hover:bg-opacity-90 text-white rounded-full p-1.5 md:p-2 z-10">
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}

            {isImage ? (
              <div className="relative">
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-auto h-auto max-w-[90vw] md:max-w-[95vw] max-h-[60vh] md:max-h-[72vh] object-contain rounded-xl shadow-lg"
                  style={{
                    maxHeight: '60vh',
                    maxWidth: '90vw'
                  }}
                />

                {showEmojiPicker && (
                  <div className="absolute top-12 md:top-16 left-1/2 -translate-x-1/2 z-40 bg-black/90 p-2 md:p-4 rounded-lg shadow-lg">
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-1 md:gap-2 mb-2">
                      {commonEmojis.map(emoji => (
                        <button
                          key={emoji}
                          className="text-lg md:text-2xl hover:bg-gray-700 p-1 md:p-2 rounded"
                          onClick={() => {
                            setCaption(prev => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <button
                      className="w-full bg-gray-700 text-white py-1 px-2 rounded text-xs md:text-sm"
                      onClick={() => setShowEmojiPicker(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : attachment.type === 'video' ? (
              <video
                src={attachment.url}
                controls
                className="max-w-[90vw] md:max-w-2xl w-full max-h-[50vh] md:max-h-[60vh] rounded-xl shadow-lg bg-black object-contain"
                style={{ maxHeight: '50vh' }}
              />
            ) : attachment.type === 'audio' ? (
              <div className="bg-gray-800 p-4 md:p-8 rounded-lg">
                <audio
                  src={attachment.url}
                  controls
                  className="w-full"
                />
              </div>
            ) : (
              <div className="bg-gray-800 p-4 md:p-8 rounded-lg">
                <a
                  href={attachment.url}
                  download={attachment.name}
                  className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
                >
                  <FiDownload className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Download {attachment.name}</span>
                </a>
              </div>
            )}

            {attachments.length > 1 && (
              <button onClick={handleNext} className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-60 hover:bg-opacity-90 text-white rounded-full p-1.5 md:p-2 z-10">
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-900">
          <div className="flex items-center justify-center py-1 md:py-2 space-x-1 md:space-x-2">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className={`relative w-8 h-8 md:w-12 md:h-12 rounded-lg overflow-hidden border-2 ${idx === currentMediaIndex ? 'border-green-500' : 'border-gray-700'} bg-gray-800 cursor-pointer flex flex-col items-center justify-center`}
                onClick={() => {
                  setCurrentMediaIndex(idx);
                }}
              >
                {att.type === 'image' ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs">
                    {att.type.charAt(0).toUpperCase()}
                  </div>
                )}
                {attachments.length > 1 && (
                  <button
                    className="absolute top-0.5 md:top-1 right-0.5 md:right-1 bg-white text-black rounded-full p-0.5 shadow hover:bg-red-500 hover:text-white z-20 border border-gray-300"
                    onClick={e => {
                      e.stopPropagation();
                      if (onRemoveMedia) onRemoveMedia(idx);
                    }}
                    title="Remove"
                  >
                    <FiX className="w-2 h-2 md:w-3 md:h-3" />
                  </button>
                )}
              </div>
            ))}

            {onAddMore && (
              <div
                className="w-8 h-8 md:w-12 md:h-12 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={onAddMore}
                title="Add more media"
              >
                <FiPlus className="w-4 h-4 md:w-6 md:h-6 text-gray-300" />
              </div>
            )}
          </div>

          <div className="px-2 md:px-4 pb-2 md:pb-4 flex items-end space-x-2 md:space-x-3">
            <div className="flex-1 bg-gray-800 rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center">
              <input
                type="text"
                placeholder="Add a caption..."
                value={caption}
                onChange={handleCaptionChange}
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm md:text-base outline-none"
                maxLength={1024}
              />
              <button
                className="text-gray-400 hover:text-white ml-1 md:ml-2 transition-colors"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add emoji to caption"
              >
                <FiSmile className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <button
              onClick={handleSend}
              className="bg-green-500 hover:bg-green-600 rounded-full p-2 md:p-3 transition-colors shadow-lg"
              title="Send"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </div>
        </div>


      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};