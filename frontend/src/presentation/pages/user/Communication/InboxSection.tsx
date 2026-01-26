import { useState } from 'react';
import { useCommunicationManagement } from '../../../../application/hooks/useCommunication';
import { FaTrash, FaEnvelopeOpen } from 'react-icons/fa';
import WarningModal from '../../../components/common/WarningModal';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../appStore/store';
import { Message, Recipient } from '../../../../domain/types/user/communication';

interface InboxSectionProps {
  onCompose?: () => void;
}

export default function InboxSection({ onCompose }: InboxSectionProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const { inboxMessages: messages, isLoadingInbox: isLoading, handleViewMessage, handleDeleteMessage } =
    useCommunicationManagement({ fetchInbox: true, fetchSent: false });
  const { styles, theme } = usePreferences();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleMessageClick = (message: Message) => {
    const currentUserId = user?.id;
    const currentUserRecipient = message.recipients.find(r => r.id === currentUserId);
    const isCurrentUserUnread = currentUserRecipient?.status === 'unread';

    setSelectedMessage(message);
    if (isCurrentUserUnread) {
      handleViewMessage(message.id);
    }
  };

  const handleDelete = (message: Message) => {
    setMessageToDelete(message);
    setShowDeleteWarning(true);
  };

  const handleConfirmDelete = () => {
    if (messageToDelete) {
      handleDeleteMessage(messageToDelete.id);
      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
      }
      setShowDeleteWarning(false);
      setMessageToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${styles.button.primary.split(' ')[0]}`}></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`relative overflow-hidden rounded-t-2xl shadow-xl bg-gradient-to-r ${styles.accent} group mb-6`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${styles.orb.primary}`}></div>
        <div className={`absolute -top-8 -left-8 w-48 h-48 rounded-full bg-gradient-to-br ${styles.orb.primary} blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${styles.orb.secondary} blur-2xl animate-pulse delay-700`}></div>
        <div className="relative z-10 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                <FaEnvelopeOpen size={20} className="text-white relative z-10" />
              </div>
              <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
                Inbox
              </h2>
              <div className={`h-1 w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-24 transition-all duration-300`}></div>
            </div>
          </div>
          {onCompose && (
            <button
              onClick={onCompose}
              className={`group/btn bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white py-2 px-4 rounded-full transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center space-x-2`}
            >
              <FaEnvelopeOpen size={12} className="rotate-12" />
              <span>Compose Message</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 relative overflow-hidden rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl blur transition-all duration-300`}></div>
          <div className="relative z-10 divide-y divide-amber-100/50">
            {(messages as Message[]).map((message) => {
              const currentUserId = user?.id;
              const currentUserRecipient = message?.recipients.find((r: Recipient) => r?.id === currentUserId);
              const isCurrentUserUnread = currentUserRecipient?.status === 'unread';
              const senderName = message?.sender?.name || message?.sender?.email || 'U';
              const initial = senderName.charAt(0).toUpperCase();

              return (
                <div
                  key={message?.id}
                  className={`p-4 cursor-pointer group/item hover:bg-amber-50/50 transition-all duration-300 border-l-4 ${selectedMessage?.id === message?.id ? `bg-orange-50/70 border-orange-400` : `border-transparent hover:border-amber-200`
                    }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${styles.accent} flex items-center justify-center text-white font-bold shadow-sm transition-transform duration-300 group-hover/item:scale-105`}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center space-x-2 min-w-0">
                          {isCurrentUserUnread && (
                            <span className={`w-2 h-2 rounded-full ${styles.status.warning} animate-pulse flex-shrink-0`}></span>
                          )}
                          <h3 className={`font-semibold ${styles.textPrimary} text-sm truncate ${isCurrentUserUnread ? 'text-blue-600' : ''}`}>{message?.sender?.name || 'Unknown'}</h3>
                        </div>
                        <span className={`text-[10px] ${styles.textSecondary} flex-shrink-0 ml-2`}>{new Date(message?.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className={`text-xs font-medium ${styles.textPrimary} truncate mb-1 ${isCurrentUserUnread ? 'font-bold' : ''}`}>{message?.subject}</h4>
                      <p className={`text-[11px] ${styles.textSecondary} truncate mt-1 leading-relaxed`}>{message?.content}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message);
                      }}
                      className={`flex-shrink-0 p-1 opacity-0 group-hover/item:opacity-100 ${styles.icon.secondary} hover:${styles.status.error} transition-all duration-300 transform scale-75 hover:scale-100`}
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className={`flex flex-col items-center justify-center p-8 text-center ${styles.textSecondary}`}>
                <FaEnvelopeOpen size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No messages in your inbox</p>
              </div>
            )}
          </div>
        </div>

        <div className={`lg:col-span-2 relative overflow-hidden rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl blur transition-all duration-300`}></div>
          <div className="relative z-10 p-4 sm:p-6">
            {selectedMessage ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6">
                  <div>
                    <h2 className={`text-lg sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>{selectedMessage.subject}</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
                      <span className={`${styles.textSecondary}`}>From: {selectedMessage.sender.name} ({selectedMessage.sender.email})</span>
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm ${styles.textSecondary} mt-2 sm:mt-0`}>
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className={`prose max-w-none text-sm sm:text-base border-t ${styles.border} pt-6`}>
                  <p className={`${styles.textPrimary} whitespace-pre-wrap leading-relaxed`}>{selectedMessage.content}</p>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center h-48 sm:h-64 ${styles.textSecondary}`}>
                <FaEnvelopeOpen size={48} className="mb-4 opacity-10" />
                <p className="text-sm sm:text-base">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <WarningModal
        isOpen={showDeleteWarning}
        onClose={() => {
          setShowDeleteWarning(false);
          setMessageToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Message"
        message={messageToDelete ? `Are you sure you want to delete "${messageToDelete.subject}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
