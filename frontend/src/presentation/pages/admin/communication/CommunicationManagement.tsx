import React, { useState } from 'react';
import {
  IoMailOutline as Mail,
  IoMailOpenOutline as Inbox,
  IoSendOutline as Send,
  IoCreateOutline as Edit,
  IoTrashOutline as Trash2,
  IoEyeOutline as Eye,
  IoReturnUpBackOutline as Reply,
  IoArchiveOutline as Archive,
  IoPersonOutline as Users,
} from 'react-icons/io5';
import { useCommunicationManagement } from '../../../../application/hooks/useCommunication';
import Header from '../../../components/admin/management/Header';
import ApplicationsTable from '../../../components/admin/management/ApplicationsTable';
import Pagination from '../../../components/admin/management/Pagination';
import WarningModal from '../../../components/common/WarningModal';
import ComposeMessageModal from './ComposeMessageModal';
import MessageDetailsModal from './MessageDetailsModal';

import { TransformedMessage } from '../../../../domain/types/management/communicationmanagement';
import { STATUSES, USER_GROUPS, inboxColumns, sentColumns } from '../../../../shared/constants/communicationManagementConstants';

import { Message } from '../../../../domain/types/user/communication';

const CommunicationManagement: React.FC = () => {
  const {
    inboxMessages,
    sentMessages,
    totalInboxPages,
    totalSentPages,
    isLoadingInbox,
    isLoadingSent,
    page,
    setPage,
    filters,
    setFilters,
    handleSendMessage,

    handleDeleteMessage,
    handleArchiveMessage,
    handleViewMessage,
    fetchSentMessages,
    debouncedSearch,
    debouncedFilterChange,
    fetchUsers,
  } = useCommunicationManagement({ isAdmin: true });


  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');



  const handleViewMessageWithModal = (message: Message) => {
    setSelectedMessage(message);
    setShowMessageDetails(true);
    handleViewMessage(message.id);
  };

  const handleReplyMessageWithModal = (message: Message) => {
    setSelectedMessage(message);
    setShowComposeModal(true);
  };

  const handleDeleteMessageWithModal = (message: Message) => {
    setMessageToDelete(message);
    setShowDeleteWarning(true);
  };

  const handleConfirmDelete = () => {
    if (messageToDelete) {
      handleDeleteMessage(messageToDelete.id);
      setShowDeleteWarning(false);
      setMessageToDelete(null);
    }
  };

  const handleArchiveMessageWithSender = (message: Message) => {
    handleArchiveMessage(message);
  };

  const inboxActions = [
    {
      icon: <Eye size={16} />,
      label: 'View Message',
      onClick: (item: TransformedMessage) => {
        const originalMessage = inboxMessages.find(msg => msg?.id === item.id);
        if (originalMessage) {
          handleViewMessageWithModal(originalMessage);
        }
      },
      color: 'blue' as const,
    },
    {
      icon: <Reply size={16} />,
      label: 'Reply',
      onClick: (item: TransformedMessage) => {
        const originalMessage = inboxMessages.find(msg => msg?.id === item.id);
        if (originalMessage) {
          handleReplyMessageWithModal(originalMessage);
        }
      },
      color: 'green' as const,
    },
    {
      icon: <Archive size={16} />,
      label: 'Archive',
      onClick: (item: TransformedMessage) => {
        const originalMessage = inboxMessages.find(msg => msg?.id === item.id);
        if (originalMessage) {
          handleArchiveMessageWithSender(originalMessage);
        }
      },
      color: 'blue' as const,
    },
    {
      icon: <Trash2 size={16} />,
      label: 'Delete',
      onClick: (item: TransformedMessage) => {
        const originalMessage = inboxMessages.find(msg => msg?.id === item.id);
        if (originalMessage) {
          handleDeleteMessageWithModal(originalMessage);
        }
      },
      color: 'red' as const,
    },
  ];

  const sentActions = [
    {
      icon: <Eye size={16} />,
      label: 'View Message',
      onClick: (item: TransformedMessage) => {
        const originalMessage = sentMessages.find(msg => msg?.id === item.id);
        if (originalMessage) {
          handleViewMessageWithModal(originalMessage);
        }
      },
      color: 'blue' as const,
    },
    {
      icon: <Trash2 size={16} />,
      label: 'Delete',
      onClick: (item: TransformedMessage) => {
        const originalMessage = sentMessages.find(msg => msg?.id === item.id);
        if (originalMessage) {
          handleDeleteMessageWithModal(originalMessage);
        }
      },
      color: 'red' as const,
    },
  ];

  const handleTabChange = (index: number) => {
    const tabMap = ['inbox', 'sent', 'compose'];
    const newTab = tabMap[index] as 'inbox' | 'sent' | 'compose';
    setActiveTab(newTab);
    setPage(1);

    if (newTab === 'sent') {
      fetchSentMessages();
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500/10 blur-md"
            style={{
              width: `${Math.random() * 12 + 4}px`,
              height: `${Math.random() * 12 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingMist ${Math.random() * 15 + 20}s ease-in-out infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Header
          title="Communication Management"
          subtitle="Manage all incoming and outgoing messages for admin"
          stats={[
            {
              icon: <Inbox />,
              title: 'Inbox Messages',
              value: inboxMessages.length.toString(),
              change: '+2',
              isPositive: true,
            },
            {
              icon: <Send />,
              title: 'Sent Messages',
              value: sentMessages.length.toString(),
              change: '+1',
              isPositive: true,
            },
            {
              icon: <Users />,
              title: 'Total Recipients',
              value: sentMessages.reduce((total, msg) => total + (msg?.recipientsCount || 0), 0).toString(),
              change: '+1250',
              isPositive: true,
            },
          ]}
          tabs={[
            { label: 'Inbox', icon: <Inbox size={16} />, active: activeTab === 'inbox' },
            { label: 'Sent', icon: <Send size={16} />, active: activeTab === 'sent' },
            { label: 'Compose', icon: <Edit size={16} />, active: activeTab === 'compose' },
          ]}
          searchQuery={searchQuery}
          setSearchQuery={(val) => {
            setSearchQuery(val);
            debouncedSearch(val);
          }}
          searchPlaceholder="Search messages..."
          filters={filters}
          filterOptions={{
            status: STATUSES,
            to: ['All Recipients', 'All Students', 'Individual Students'],
          }}
          debouncedFilterChange={debouncedFilterChange}
          handleResetFilters={() => setFilters({ status: 'All Statuses', to: 'All Recipients', search: '' })}
          onTabClick={handleTabChange}
        />

        <div className="mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-purple-500/20">
            <div className="px-6 py-5">
              {activeTab === 'compose' ? (
                <button
                  onClick={() => setShowComposeModal(true)}
                  className="mb-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit size={16} />
                  Compose Message
                </button>
              ) : (
                <>
                  {activeTab === 'inbox' && !isLoadingInbox && inboxMessages.length > 0 && (
                    <>
                      <ApplicationsTable data={inboxMessages.filter(msg => msg && msg.id).map((msg) => {
                        if (!msg) return null;
                        return {
                          ...msg,
                          id: msg.id,
                          sender: msg.sender ? { ...msg.sender, id: msg.sender.id } : undefined,
                          recipients: typeof msg.recipients === 'string'
                            ? msg.recipients
                            : msg.recipients.map((r: any) => r.name || 'Unknown').join(', ')
                        };
                      }).filter(Boolean) as TransformedMessage[]} columns={inboxColumns} actions={inboxActions} />
                      <Pagination
                        page={page}
                        totalPages={totalInboxPages}
                        itemsCount={inboxMessages.length}
                        itemName="messages"
                        onPageChange={setPage}
                        onFirstPage={() => setPage(1)}
                        onLastPage={() => setPage(totalInboxPages)}
                      />
                    </>
                  )}
                  {activeTab === 'sent' && !isLoadingSent && sentMessages.length > 0 && (
                    <>
                      <ApplicationsTable data={sentMessages.filter(msg => msg && msg.id).map((msg) => {
                        if (!msg) return null;
                        return {
                          ...msg,
                          id: msg.id,
                          sender: msg.sender ? { ...msg.sender, id: msg.sender.id } : undefined,
                          recipients: typeof msg.recipients === 'string'
                            ? msg.recipients
                            : msg.recipients.map((r: any) => r.name || 'Unknown').join(', ')
                        };
                      }).filter(Boolean) as TransformedMessage[]} columns={sentColumns} actions={sentActions} />
                      <Pagination
                        page={page}
                        totalPages={totalSentPages}
                        itemsCount={sentMessages.length}
                        itemName="messages"
                        onPageChange={setPage}
                        onFirstPage={() => setPage(1)}
                        onLastPage={() => setPage(totalSentPages)}
                      />
                    </>
                  )}
                  {((activeTab === 'inbox' && !isLoadingInbox && inboxMessages.length === 0) ||
                    (activeTab === 'sent' && !isLoadingSent && sentMessages.length === 0)) && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                          <Mail size={32} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No Messages Found</h3>
                        <p className="text-gray-400 text-center max-w-sm">
                          There are no messages matching your current filters. Try adjusting your search criteria.
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ComposeMessageModal
        isOpen={showComposeModal}
        initialForm={
          selectedMessage && selectedMessage.sender
            ? {
              to: [{ value: selectedMessage.sender.id, label: selectedMessage.sender.name }],
              subject: `Re: ${selectedMessage.subject}`,
              message: '',
              isAdmin: true
            }
            : { to: [], subject: '', message: '', isAdmin: true }
        }
        userGroups={USER_GROUPS}
        onSend={(form) => {
          handleSendMessage({ ...form, isAdmin: true });
          setShowComposeModal(false);
          setSelectedMessage(null);
        }}
        onCancel={() => {
          setShowComposeModal(false);
          setSelectedMessage(null);
        }}
        fetchUsers={fetchUsers}
      />

      {selectedMessage && (
        <MessageDetailsModal
          isOpen={showMessageDetails}
          message={selectedMessage}
          onReply={() => {
            handleReplyMessageWithModal(selectedMessage);
            setShowMessageDetails(false);
          }}
          onArchive={() => {
            handleArchiveMessageWithSender(selectedMessage);
            setShowMessageDetails(false);
          }}
          onDelete={() => {
            handleDeleteMessage(selectedMessage.id);
            setShowMessageDetails(false);
          }}
          onClose={() => {
            setShowMessageDetails(false);
            setSelectedMessage(null);
          }}
          messageType={activeTab as 'inbox' | 'sent'}
        />
      )}

      <WarningModal
        isOpen={showDeleteWarning}
        onClose={() => {
          setShowDeleteWarning(false);
          setMessageToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Message"
        message={messageToDelete ? `Are you sure you want to delete the message "${messageToDelete.subject}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <style>{`
        @keyframes floatingMist {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(15px);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default CommunicationManagement; 