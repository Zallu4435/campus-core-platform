import React from 'react';
import { FiUsers } from 'react-icons/fi';
import { formatChatTime } from '../utils/chatUtils';
import { ChatListProps, Message } from '../../../../../domain/types/canvas/chat';

const formatLastMessage = (message: Message): string => {
  if (!message) return '';

  if (message.attachments && message.attachments.length > 0) {
    const attachment = message.attachments[0];
    switch (attachment.type) {
      case 'audio':
        return '🎵 Audio';
      case 'video':
        return '🎥 Video';
      case 'image':
        return '📷 Image';
      case 'document':
        return '📄 Document';
      case 'file':
        return '📎 File';
      default:
        return '📎 Attachment';
    }
  }

  switch (message.type) {
    case 'audio':
      return '🎵 Audio';
    case 'video':
      return '🎥 Video';
    case 'image':
      return '📷 Image';
    case 'file':
      return '📎 File';
    case 'text':
    default:
      return message.content || '';
  }
};

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onChatSelect,
  onScroll,
  currentUserId
}) => {

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#111b21]">
      <div className="flex-1 overflow-y-auto" onScroll={onScroll}>
        {chats.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-[#2a3942] ${selectedChatId === chat.id ? 'bg-gray-200 dark:bg-[#2c3e50]' : ''
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {chat.avatar ? (
                    <img src={chat.avatar} alt={chat.name || 'Chat'} className="w-full h-full rounded-full" />
                  ) : (
                    <FiUsers size={24} className="text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate text-left">
                      {chat.type === 'group' ? (
                        <>
                          {chat.name}
                          {chat.isAdmin && <span className="ml-2 text-xs text-blue-500">(Admin)</span>}
                        </>
                      ) : (
                        chat.name || 'Unknown User'
                      )}
                    </h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {formatChatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate text-left">
                      {chat.lastMessage ? (
                        <>
                          {(chat.type === 'group' || chat.type === 'direct') && (
                            <span className="font-medium">
                              {chat.lastMessage.senderId === currentUserId
                                ? 'You'
                                : chat.participants.find(p => p.id === chat.lastMessage?.senderId)?.firstName}
                              :
                            </span>
                          )}{' '}
                          {formatLastMessage({
                            id: chat.lastMessage.id,
                            chatId: chat.id,
                            senderId: chat.lastMessage.senderId,
                            senderName: chat.participants.find(p => p.id === chat.lastMessage?.senderId)?.firstName + ' ' + chat.participants.find(p => p.id === chat.lastMessage?.senderId)?.lastName || '',
                            content: chat.lastMessage.content,
                            type: chat.lastMessage.type as Message['type'],
                            fileUrl: undefined,
                            fileName: undefined,
                            fileSize: undefined,
                            fileType: undefined,
                            replyToId: undefined,
                            replyTo: undefined,
                            forwardedFrom: undefined,
                            reactions: [],
                            status: chat.lastMessage.status as Message['status'],
                            createdAt: chat.lastMessage.createdAt,
                            updatedAt: chat.lastMessage.createdAt,
                            deletedAt: undefined,
                            deletedFor: undefined,
                            isDeleted: false,
                            deletedForEveryone: false,
                            attachments: undefined,
                          })}
                        </>
                      ) : (
                        <span className="italic text-gray-400">No messages yet</span>
                      )}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-500 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <FiUsers size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">No chats yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Find users to start a conversation or create a new group.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};