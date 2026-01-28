import React, { useState, useRef, ForwardedRef } from 'react';
import { formatMessageTime, formatMessageTimeOnly, shouldShowDateHeader } from '../utils/chatUtils';
import { FiCheck, FiCornerUpLeft, FiSmile, FiFile, FiChevronDown } from 'react-icons/fi';
import { EmojiPicker } from './EmojiPicker';
import { MessageDropdown } from './MessageDropdown';
import { DeleteMessageModal } from './DeleteMessageModal';
import { MessageReactionsModal } from './MessageReactionsModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import { useChatMutations } from '../hooks/useChatMutations';
import AudioPlayer from './AudioPlayer';
import { ChatMessageProps } from '../../../../../domain/types/canvas/chat';

const ChatMessageComponent = ({
  message,
  previousMessage,
  styles,
  onDelete,
  onReply,
  onReplyClick,
  currentUserId
}: ChatMessageProps, ref: ForwardedRef<HTMLDivElement>) => {

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const reactionIconRef = useRef<HTMLDivElement | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const { editMessage, addReaction, removeReaction } = useChatMutations(message.chatId, currentUserId);

  const handleOpenReactionsModal = (event: React.MouseEvent) => {
    const rect = reactionIconRef.current?.getBoundingClientRect();
    if (rect) {
      setModalPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY + 8
      });
    } else {
      setModalPosition({ x: event.clientX, y: event.clientY });
    }
    setShowReactionsModal(true);
  };

  const handleEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      editMessage.mutate({ chatId: message.chatId, messageId: message.id, newContent: editedContent });
    }
    setIsEditing(false);
  };

  const handleAddReaction = (emoji: string) => {
    addReaction.mutate({ messageId: message.id, emoji });
    setShowEmojiPicker(false);
  };

  const handleRemoveReaction = () => {
    removeReaction.mutate({ messageId: message.id });
    setShowReactionsModal(false);
  };

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImageUrl(imageUrl);
    setShowImagePreview(true);
  };

  const handleDeleteForMe = () => {
    if (!message.id || message.id === 'false' || typeof message.id !== 'string') {
      console.error('[ChatMessage] Invalid message.id for delete:', message.id);
      return;
    }
    onDelete(message.id, false);
  };

  const handleDeleteForEveryone = () => {
    if (!message.id || message.id === 'false' || typeof message.id !== 'string') {
      console.error('[ChatMessage] Invalid message.id for delete (everyone):', message.id);
      return;
    }
    onDelete(message.id, true);
  };

  const renderStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <FiCheck className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return (
          <>
            <FiCheck className="w-3 h-3 text-gray-400" />
            <FiCheck className="w-3 h-3 -ml-1 text-gray-400" />
          </>
        );
      case 'read':
        return (
          <>
            <FiCheck className="w-3 h-3 text-blue-500" />
            <FiCheck className="w-3 h-3 -ml-1 text-blue-500" />
          </>
        );
      default:
        return null;
    }
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0 || message.isDeleted) return null;

    const isSentMessage = message.senderId === currentUserId;

    const groupedReactions = message.reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = { userIds: [], users: [] };
      }
      acc[reaction.emoji].userIds.push(reaction.userId);
      acc[reaction.emoji].users.push(`User ${reaction.userId.slice(-4)}`);
      return acc;
    }, {} as { [key: string]: { userIds: string[], users: string[] } });

    return (
      <div
        ref={reactionIconRef}
        className={`absolute -bottom-2 ${isSentMessage ? 'right-2' : 'left-2'} z-10`}
        onClick={handleOpenReactionsModal}
      >
        <div className="flex flex-wrap gap-1">
          {Object.entries(groupedReactions).map(([emoji, data]) => (
            <div key={emoji} className="group relative inline-block">
              <div
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs cursor-pointer shadow-sm border ${data.userIds.includes(currentUserId)
                  ? 'bg-blue-100 text-blue-600 border-blue-200'
                  : 'bg-white text-gray-600 border-gray-200 dark:bg-[#2a3942] dark:text-gray-300 dark:border-gray-600'
                  }`}
              >
                <span>{emoji}</span>
                {data.userIds.length > 1 && (
                  <span className="text-[10px] font-medium">{data.userIds.length}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // DEBUG LOG


  const renderReplyTo = () => {
    if (!message.replyTo) return null;

    const replyTo = typeof message.replyTo === 'string'
      ? { id: message.replyTo, content: '', senderId: '', senderName: 'Unknown', type: 'text' as const, createdAt: '' }
      : message.replyTo;

    return (
      <div
        className={`mb-2 p-2 rounded-lg flex items-start cursor-pointer hover:bg-opacity-20 transition-all border-l-4 border-green-500 ${isSentMessage
          ? 'bg-white/10 text-white/90'
          : 'bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300'
          }`}
        onClick={() => onReplyClick && onReplyClick(replyTo.id)}
      >
        <FiCornerUpLeft className={`w-4 h-4 mr-2 flex-shrink-0 mt-0.5 ${isSentMessage ? 'text-white/70' : 'text-gray-500'}`} />
        <div className="text-sm truncate flex-1">
          <div className="font-medium text-[11px] opacity-75 mb-0.5 uppercase tracking-wider">
            {replyTo.senderId === currentUserId ? 'You' : (replyTo.senderName || 'User')}
          </div>
          <div className="truncate text-[13px]">{replyTo.content}</div>
        </div>
      </div>
    );
  };

  const renderForwardedFrom = () => {
    if (!message.forwardedFrom) return null;

    return (
      <div className="mb-2 text-xs text-gray-500 dark:text-gray-400 italic opacity-75">
        Forwarded from {message.forwardedFrom.chatName}
      </div>
    );
  };

  const renderMediaGrid = () => {
    const imageAttachments = message.attachments?.filter(att => att.type === 'image') || [];
    if (imageAttachments.length === 0) return null;

    const gridClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-2',
      4: 'grid-cols-2',
    };

    const imageClasses = {
      1: 'max-w-xs md:max-w-sm w-full',
      2: 'w-full max-h-32 md:max-h-48 object-cover',
      3: 'w-full max-h-32 md:max-h-48 object-cover',
      4: 'w-full max-h-28 md:max-h-40 object-cover',
    };

    return (
      <div className="mt-2">
        <div className={`grid ${gridClasses[Math.min(imageAttachments.length, 4) as keyof typeof gridClasses]} gap-1`}>
          {imageAttachments.map((attachment, idx) => {
            const isFullWidth = imageAttachments.length === 3 && idx === 0;
            const gridColumnClass = isFullWidth ? 'col-span-2' : '';

            return (
              <div
                key={attachment.id || attachment.url}
                className={`relative group ${gridColumnClass} ${idx >= 4 ? 'hidden' : ''}`}
              >
                <div onClick={(e) => handleImageClick(e, attachment.url)} className="cursor-pointer">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className={`rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${imageClasses[Math.min(imageAttachments.length, 4) as keyof typeof imageClasses]
                      }`}
                  />
                  {idx === 3 && imageAttachments.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-medium">+{imageAttachments.length - 4}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {message.content && message.content.trim() && (
          <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 break-words px-1">
            {message.content}
          </div>
        )}
      </div>
    );
  };

  const renderMessageContent = () => {
    if (message.isDeleted) {
      return (
        <div className="pr-12 pb-1">
          <p className="text-sm text-gray-500 italic">This message was deleted</p>
          <div className="flex items-center justify-end space-x-1 mt-1">
            <span className="text-xs text-gray-400">
              {formatMessageTimeOnly(message.createdAt)}
            </span>
            {message.senderId === currentUserId && (
              <div className="flex items-center">
                {renderStatusIcon()}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="pr-2 pb-1 min-w-[200px]">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleEdit();
              } else if (e.key === 'Escape') {
                setIsEditing(false);
                setEditedContent(message.content);
              }
            }}
            className="w-full p-2 text-sm border rounded-lg bg-white/10 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none min-h-[60px]"
            autoFocus
            placeholder="Edit message..."
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-full transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(message.content);
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-full transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-gray-400 italic">
                Ctrl + Enter to save
              </span>
              <span className="text-[10px] text-gray-400">
                {formatMessageTimeOnly(message.createdAt)}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        {!(message.attachments && message.attachments.some(att => att.type === 'image')) && (
          <div className="pr-12 pb-1">
            <p className="text-sm break-words leading-relaxed">{message.content}</p>
          </div>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.some(att => att.type === 'image') && renderMediaGrid()}

            {message.attachments.filter(att => att.type !== 'image').map((attachment, idx) => {
              switch (attachment.type) {
                case 'video':
                  return (
                    <div key={attachment.id || idx} className="relative">
                      <video
                        src={attachment.url}
                        controls
                        className="max-w-sm rounded-lg"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  );
                case 'audio':
                  return (
                    <div key={attachment.id || idx} className="relative">
                      <AudioPlayer src={attachment.url} />
                    </div>
                  );
                case 'document':
                case 'file':
                  return (
                    <div key={attachment.id || idx} className="flex items-center space-x-2 p-2 bg-black bg-opacity-10 rounded-lg">
                      <FiFile className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{attachment.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(attachment.size ? (attachment.size / 1024).toFixed(1) : '0')} KB</p>
                      </div>
                      <a
                        href={attachment.url}
                        download={attachment.name}
                        className="flex-shrink-0 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  );
                default:
                  return (
                    <div key={attachment.id || idx} className="relative">
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        Download {attachment.name || 'file'}
                      </a>
                    </div>
                  );
              }
            })}
          </div>
        )}

        <div className="flex items-center justify-end space-x-1">
          <span className={`text-xs ${isSentMessage
            ? 'text-white text-opacity-70'
            : 'text-gray-500 dark:text-gray-400'
            }`}>
            {message.isEdited && <span className="text-[10px] mr-1 italic">Edited</span>}
            {formatMessageTimeOnly(message.createdAt)}
          </span>
          {message.senderId === currentUserId && (
            <div className="flex items-center">
              {renderStatusIcon()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const isSentMessage = message.senderId === currentUserId;

  if (message.isDeleted && message.deletedForEveryone && isSentMessage) {
    return null;
  }

  return (
    <div ref={ref}>
      {shouldShowDateHeader(message, previousMessage) && (
        <div className="flex justify-center my-4">
          <div className="px-4 py-1 rounded-full bg-gray-200 dark:bg-[#2a3942] text-sm text-gray-600 dark:text-gray-400">
            {formatMessageTime(message.createdAt)}
          </div>
        </div>
      )}

      <div id={`message-${message.id}`} className={`group relative flex mb-4 ${isSentMessage ? 'justify-end' : 'justify-start'}`}>
        {isSentMessage && !message.isDeleted && (
          <div className="flex items-center space-x-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="React"
            >
              <FiSmile className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative">
          <div
            className={`relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg px-3 py-2 ${isSentMessage
              ? 'bg-[#005c4b] text-white rounded-br-none'
              : 'bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-bl-none shadow-sm border border-gray-200 dark:border-gray-600'
              }`}
          >
            {/* Spinner overlay while sending */}
            {message.status === 'sending' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 rounded-lg z-10">
                <div className="animate-spin h-6 w-6 border-4 border-blue-400 border-t-transparent rounded-full" />
              </div>
            )}

            {/* Tail for message bubble */}
            <div
              className={`absolute w-0 h-0 bottom-0 ${isSentMessage
                ? 'right-0 border-l-[8px] border-l-[#005c4b] border-b-[8px] border-b-transparent'
                : 'left-0 border-r-[8px] border-r-white dark:border-r-[#2a3942] border-b-[8px] border-b-transparent'
                }`}
            />

            {renderForwardedFrom()}
            {renderReplyTo()}
            {renderMessageContent()}

            {!message.isDeleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-full bg-white dark:bg-[#202c33] shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#2a3942]"
                title="More options"
              >
                <FiChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {!message.isDeleted && (
              <MessageDropdown
                message={message}
                currentUserId={currentUserId}
                isVisible={showMenu}
                onClose={() => setShowMenu(false)}
                onReact={() => setShowEmojiPicker(true)}
                onReply={() => onReply(message)}
                onEdit={() => setIsEditing(true)}
                onDelete={handleDeleteForMe}
                onShowDeleteOptions={() => setShowDeleteOptions(true)}
              />
            )}

            {showEmojiPicker && !message.isDeleted && (
              <EmojiPicker
                styles={styles}
                show={showEmojiPicker}
                onEmojiSelect={handleAddReaction}
                onClose={() => setShowEmojiPicker(false)}
                position={isSentMessage ? 'top' : 'bottom'}
              />
            )}
          </div>

          {renderReactions()}
        </div>

        {!isSentMessage && !message.isDeleted && (
          <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="React"
            >
              <FiSmile className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <DeleteMessageModal
        isVisible={showDeleteOptions}
        isSentMessage={isSentMessage}
        onClose={() => setShowDeleteOptions(false)}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={isSentMessage ? handleDeleteForEveryone : undefined}
      />

      {showImagePreview && (
        <ImagePreviewModal
          imageUrl={previewImageUrl}
          onClose={() => setShowImagePreview(false)}
        />
      )}

      <MessageReactionsModal
        isVisible={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        reactions={
          (message.reactions || []).map(reaction => ({
            id: reaction.id || `reaction-${reaction.emoji}-${reaction.userId}`,
            emoji: reaction.emoji,
            userId: reaction.userId,
            userName: `User ${reaction.userId.slice(-4)}`,
            createdAt: reaction.createdAt || new Date().toISOString(),
            count: 1
          }))
        }
        currentUserId={currentUserId}
        onAddReaction={handleAddReaction}
        onRemoveReaction={handleRemoveReaction}
        position={modalPosition}
      />
    </div >
  );
};

export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(ChatMessageComponent);