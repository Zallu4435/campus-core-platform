import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatList } from './components/ChatList';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { Chat, Message, User } from '../../../../domain/types/canvas/chat';
import { getStyles } from './utils/chatUtils';
import { FiPlus, FiUser, FiArrowLeft, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../appStore/store';
import { toast } from 'react-hot-toast';
import CreateGroupModal from './components/CreateGroupModal';
import GroupSettingsModal from './components/GroupSettingsModal';
import { useChatQueries } from './hooks/useChatQueries';
import { useChatMutations } from './hooks/useChatMutations';
import { chatService } from './services/chatService';
import { useChatSocket } from './hooks/useChatSocket';


export const ChatComponent: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setShowInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTyping,] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setShowNewChat] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [, setOldestMessageTimestamp] = useState<string | null>(null);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const styles = getStyles(isDarkMode);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [chatsPage, setChatsPage] = useState(1);
  const [hasMoreChats,] = useState(true);
  const [loadingMoreChats, setLoadingMoreChats] = useState(false);
  const scrollState = useRef({
    shouldScrollToBottom: true,
    oldScrollHeight: 0,
  }).current;

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?.id;

  const { socketError, onlineUsers, emitTyping } = useChatSocket(selectedChatId, {
    onChatDeleted: (data) => {
      if (selectedChatId === data.chatId) {
        setSelectedChatId(null);
        setShowMobileChat(false);
        if (data.initiatorId !== currentUserId) {
          toast.error('This chat has been deleted');
        }
      }
    },
    onParticipantRemoved: (data) => {
      if (selectedChatId === data.chatId) {
        setSelectedChatId(null);
        setShowMobileChat(false);
        if (data.initiatorId !== currentUserId) {
          toast.error('You have been removed from this group');
        }
      }
    },
    onChatBlocked: (data) => {
      if (selectedChatId === data.chatId) {
        // The memoized isBlockedByMe/isBlockedMe will update after query invalidation
        if (data.isBlocked) {
          if (data.initiatorId !== currentUserId) {
            if (data.blockerId !== currentUserId) {
              toast.error('You have been blocked');
            } else {
              toast.success('User blocked');
              setSelectedChatId(null); // Optionally close the chat if I'm the blocker
            }
          }
        } else {
          if (data.initiatorId !== currentUserId) {
            toast.success('User unblocked');
          }
        }
      }
    },
    onGroupUpdated: (data) => {
      if (selectedChatId === data.chatId && data.initiatorId !== currentUserId) {
        if (data.type === 'settings') {
          toast.success('Group settings updated');
        } else if (data.type === 'admin') {
          toast.success(`Admin status updated`);
        } else if (data.type === 'info') {
          toast.success('Group information updated');
        } else if (data.type === 'memberLeft') {
          toast.success('A member has left the group');
        }
      }
    }
  });

  const {
    chatsResponse,
    isLoadingChats,
    chatDetails,
    messagesResponse,
    isLoadingMessages,
    searchUsers
  } = useChatQueries({
    chatId: selectedChatId || undefined,
    messagesPage,
    messagesLimit: 20,
    chatsPage,
    chatsLimit: 20,
    query: debouncedQuery
  });

  useEffect(() => {
    if (searchUsers?.data) {
      setSearchResults(searchUsers.data);
      setIsSearching(false);
    }
  }, [searchUsers]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const messages = messagesResponse?.messages || [];
  const chats = chatsResponse?.data || [];

  const chatMutations = useChatMutations(selectedChatId || undefined, currentUserId);

  const flatChat = useMemo(() => {
    if (!chatDetails) return null;
    // Hydrate participants from the separate participants array in ChatDetails
    const chatBase = 'chat' in chatDetails ? (chatDetails as any).chat : chatDetails;
    const participants = 'participants' in chatDetails ? (chatDetails as any).participants : chatBase.participants;

    return {
      ...chatBase,
      participants
    } as Chat;
  }, [chatDetails]);

  const isBlockedByMe = Array.isArray(flatChat?.blockedUsers) && flatChat.blockedUsers.some(
    (entry: { blocker: string; blocked: string }) => entry.blocker === currentUserId
  );
  const isBlockedMe = Array.isArray(flatChat?.blockedUsers) && flatChat.blockedUsers.some(
    (entry: { blocker: string; blocked: string }) => entry.blocked === currentUserId
  );

  // Check if user has permission to send messages
  const canSendMessages = useMemo(() => {
    if (!flatChat) return true;
    if (flatChat.type !== 'group') return true;
    if (!flatChat.settings?.onlyAdminsCanPost) return true;
    return flatChat.admins?.includes(currentUserId || '') || false;
  }, [flatChat, currentUserId]);

  const inputDisabledReason = useMemo(() => {
    if (isBlockedByMe || isBlockedMe) return 'This chat is blocked';
    if (!canSendMessages) return 'Only admins can send messages in this group';
    return undefined;
  }, [isBlockedByMe, isBlockedMe, canSendMessages]);


  const visibleMessages = useMemo(() => {
    return allMessages.filter(message => {
      // Filter out messages deleted for everyone if I'm the sender (or others if business logic dictates)
      if (message.isDeleted && message.deletedForEveryone && message.senderId === currentUserId) {
        return false;
      }
      // Filter out messages deleted for specific users
      if (Array.isArray(message.deletedFor) && currentUserId && message.deletedFor.includes(currentUserId)) {
        return false;
      }
      // Ensure the message has a valid ID
      return !!(message.id && message.id !== 'false' && typeof message.id === 'string');
    });
  }, [allMessages, currentUserId]);

  useEffect(() => {
    setLoading(isLoadingChats);
  }, [isLoadingChats]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (messagesPage === 1 && messages.length > 0) {
      setAllMessages(messages);
      setHasMoreMessages(true);
      setTimeout(() => {
        scrollToBottom();
      }, 150);
    } else if (messagesPage > 1) {
      if (messages.length > 0) {
        setAllMessages(prev => [...messages, ...prev]);
      } else {
        setHasMoreMessages(false);
      }
    }
  }, [messages, messagesPage]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight } = e.currentTarget;
    if (scrollTop === 0 && !isLoadingMessages && !loadingMoreMessages && hasMoreMessages) {
      scrollState.shouldScrollToBottom = false;
      scrollState.oldScrollHeight = scrollHeight;
      setLoadingMoreMessages(true);
      setMessagesPage((prev) => prev + 1);
    }
  };

  const handleChatListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop < clientHeight + 1 && !isLoadingChats && !loadingMoreChats && hasMoreChats) {
      setLoadingMoreChats(true);
      setChatsPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (selectedChatId && visibleMessages.length > 0) {
      const hasUnread = visibleMessages.some(m => m.status !== 'read' && m.senderId !== currentUserId);
      if (hasUnread) {
        chatMutations.markMessagesAsRead.mutate(selectedChatId);
      }
    }
  }, [visibleMessages, selectedChatId, currentUserId]);

  useEffect(() => {
    if (!isLoadingMessages) {
      setLoadingMoreMessages(false);
    }
  }, [isLoadingMessages]);

  useEffect(() => {
    if (!isLoadingChats) {
      setLoadingMoreChats(false);
    }
  }, [isLoadingChats]);

  const handleChatSelect = async (chatId: string) => {
    if (selectedChatId !== chatId) {
      setAllMessages([]);
      setMessagesPage(1);
      setHasMoreMessages(true);
      setOldestMessageTimestamp(null);
    }

    setSelectedChatId(chatId);
    setReplyToMessage(null);

    const chatArray: Chat[] = Array.isArray(chats) ? chats : [];
    if (!chatId || !chatArray) return;

    try {
      await chatMutations.markMessagesAsRead.mutateAsync(chatId);
      scrollToBottom();
    } catch (error) {
      console.error('Error in handleChatSelect:', error);
    }
  };

  const handleUserSelect = async (user: User) => {
    try {
      const chatArray: Chat[] = Array.isArray(chats) ? (chats as Chat[]) : [];
      if (!chatArray.length) {
        const userWithName = {
          ...user,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
        };
        setPendingUser(userWithName);
        setSelectedChatId(null);
        setSearchQuery('');
        setSearchResults([]);
        setShowNewChat(false);
        setShowMobileChat(true);
        return;
      }
      const existingChat = chatArray.find((chat) => chat.type === 'direct' && chat.participants.some((p) => p.id === user.id));
      if (existingChat) {
        setSelectedChatId(existingChat.id);
        setPendingUser(null);
      } else {
        const userWithName = {
          ...user,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
        };
        setPendingUser(userWithName);
        setSelectedChatId(null);
      }
      setSearchQuery('');
      setSearchResults([]);
      setShowNewChat(false);
      setShowMobileChat(true);
    } catch (error) {
      console.error('Error in handleUserSelect:', error);
      const userWithName = {
        ...user,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
      };
      setPendingUser(userWithName);
      setSelectedChatId(null);
      setSearchQuery('');
      setSearchResults([]);
      setShowNewChat(false);
      setShowMobileChat(true);
    }
  };




  const handleDeleteMessage = async (messageId: string, deleteForEveryone: boolean) => {
    try {
      await chatMutations.deleteMessage.mutateAsync({
        chatId: selectedChatId!,
        messageId,
        deleteForEveryone
      });
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleReplyToMessage = (message: Message) => setReplyToMessage(message);

  const handleSendMessage = async (message: string, fileOrFiles?: File | File[], replyTo?: Message) => {
    if (!message.trim() && !fileOrFiles) return;

    if (!selectedChatId && pendingUser) {
      try {
        const newChat = await chatMutations.createChat.mutateAsync({
          creatorId: currentUser?.id || '',
          participantId: pendingUser.id,
          type: 'direct',
          name: `${pendingUser.firstName} ${pendingUser.lastName}`,
          avatar: pendingUser.avatar
        });
        setSelectedChatId(newChat.id);
        setPendingUser(null);
        setTimeout(() => handleSendMessage(message, fileOrFiles, replyTo), 0);
        return;
      } catch (error) {
        console.error('Failed to create chat:', error);
        return;
      }
    }

    if (!selectedChatId) return;

    try {
      if (fileOrFiles) {
        const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        if (message.trim()) formData.append('content', message.trim());
        if (replyTo) formData.append('replyTo', JSON.stringify(replyTo));
        await chatMutations.sendFile.mutateAsync({
          chatId: selectedChatId,
          formData,
          file: files[0],
          replyTo: replyTo ? {
            id: replyTo.id,
            content: replyTo.content,
            senderId: replyTo.senderId,
            senderName: replyTo.senderName,
            type: replyTo.type,
            createdAt: replyTo.createdAt?.toString() || new Date().toISOString()
          } : undefined
        });
      } else if (replyTo) {
        await chatMutations.sendMessage.mutateAsync({
          chatId: selectedChatId,
          content: message,
          type: 'text',
          replyTo: replyTo ? {
            id: replyTo.id,
            content: replyTo.content,
            senderId: replyTo.senderId,
            senderName: replyTo.senderName,
            type: replyTo.type,
            createdAt: replyTo.createdAt?.toString() || new Date().toISOString()
          } : undefined
        });
      } else {
        await chatMutations.sendMessage.mutateAsync({ chatId: selectedChatId, content: message, type: 'text' });
      }
      setReplyToMessage(null);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (isTyping: boolean) => {
    emitTyping(isTyping);
  };





  const handleUpdateGroup = async (updates: {
    name?: string;
    description?: string;
    settings?: {
      onlyAdminsCanPost?: boolean;
      onlyAdminsCanAddMembers?: boolean;
      onlyAdminsCanChangeInfo?: boolean;
      onlyAdminsCanPinMessages?: boolean;
      onlyAdminsCanSendMedia?: boolean;
      onlyAdminsCanSendLinks?: boolean;
    };
  }) => {
    if (!flatChat || !currentUser) return;
    try {
      await chatMutations.updateGroupSettings.mutateAsync(updates.settings || {});
      toast.success('Group settings updated');
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group settings');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!flatChat || !currentUser) return;
    try {
      const updatedChat = await chatMutations.removeGroupMember.mutateAsync(userId);
      setSelectedChatId(updatedChat.id);
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    if (!flatChat || !currentUser) return;
    try {
      await chatMutations.updateGroupAdmin.mutateAsync({ userId, isAdmin: true });
      toast.success('Admin added');
    } catch (error) {
      console.error('Error making admin:', error);
      toast.error('Failed to make admin');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!flatChat || !currentUser) return;
    try {
      await chatMutations.updateGroupAdmin.mutateAsync({ userId, isAdmin: false });
      toast.success('Admin removed');
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    }
  };

  const handleLeaveGroup = async () => {
    if (!flatChat) return;
    const isLastAdmin = flatChat.type === 'group' &&
      flatChat.admins?.length === 1 &&
      flatChat.admins.includes(currentUserId || '');

    if (isLastAdmin && flatChat.participants.length > 1) {
      toast.error("You can't leave the group without selecting another admin first.", { id: 'leave-group' });
      return;
    }

    try {
      await chatMutations.leaveGroup.mutateAsync();
      setSelectedChatId(null);
      setShowGroupSettings(false);
      toast.success('Left group', { id: 'leave-group' });
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group', { id: 'leave-group' });
    }
  };

  const handleDeleteGroup = async () => {
    if (!flatChat || !currentUser) return;
    try {
      setSelectedChatId(null);
      setShowGroupSettings(false);
      toast.success('Group deleted');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (allMessages.length > 0) {
      if (scrollState.shouldScrollToBottom) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else if (scrollRef.current && scrollState.oldScrollHeight) {
        const newScrollHeight = scrollRef.current.scrollHeight;
        scrollRef.current.scrollTop = newScrollHeight - scrollState.oldScrollHeight;
        scrollState.oldScrollHeight = 0;
      }
    }
  }, [allMessages]);

  useEffect(() => {
    scrollState.shouldScrollToBottom = true;
  }, [selectedChatId]);

  const handleDeleteChat = async () => {
    if (!flatChat) return;
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      try {
        await chatMutations.deleteChat.mutateAsync(flatChat.id);
        setSelectedChatId(null);
        toast.success('Chat deleted');
      } catch (error) {
        toast.error('Failed to delete chat');
      }
    }
  };
  const handleBlock = async () => {
    if (!flatChat) return;
    const action = isBlockedByMe ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${action} this ${flatChat.type === 'group' ? 'group' : 'user'}?`)) {
      try {
        await chatMutations.blockChat.mutateAsync(flatChat.id);
        if (!isBlockedByMe) {
          setSelectedChatId(null);
        }
        toast.success(`${flatChat.type === 'group' ? 'Group' : 'User'} ${action}ed`);
      } catch (error) {
        toast.error(`Failed to ${action}`);
      }
    }
  };
  const handleClearChat = async () => {
    if (!flatChat) return;
    if (window.confirm('Are you sure you want to clear all messages in this chat?')) {
      try {
        await chatMutations.clearChat.mutateAsync(flatChat.id);
        setAllMessages([]);
        toast.success('Chat cleared');
      } catch (error) {
        toast.error('Failed to clear chat');
      }
    }
  };

  const handleReplyClick = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-message');
      setTimeout(() => {
        element.classList.remove('highlight-message');
      }, 2000);
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      setShowMobileChat(true);
    }
  }, [selectedChatId]);

  const handleMobileBack = () => {
    setShowMobileChat(false);
    setSelectedChatId(null);
    setPendingUser(null);
    setReplyToMessage(null);
    setAllMessages([]);
    setMessagesPage(1);
    setHasMoreMessages(true);
  };

  if (loading) return <div className={`flex h-screen items-center justify-center ${styles.background}`}><div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full" /></div>;
  if (socketError) return (
    <div className={`flex h-screen items-center justify-center ${styles.background}`}>
      <div className="text-center">
        <p className="text-red-500 mb-4">{socketError}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Retry</button>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen ${styles.background} font-sans overflow-hidden`}>
      <div
        className={`
          transition-all duration-300 border-r border-gray-200 dark:border-[#2a3942] flex flex-col relative overflow-hidden
          w-full max-w-full md:w-[420px]
          ${showMobileChat ? 'hidden' : 'flex'}  // hide on mobile if chat is open
          md:flex  // always show on desktop
        `}
      >
        <div className="p-4 border-b border-gray-200 dark:border-[#2a3942] flex items-center justify-between relative z-10 bg-white dark:bg-[#202c33]">
          <span className="text-lg font-semibold">Chats</span>
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowSearchBar(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a3942]">
              <FiPlus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button onClick={() => setShowCreateGroup(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a3942]">
              <FiUsers className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        <div className="relative flex-1">
          <div
            className={`absolute inset-0 top-0 transition-transform duration-300 ${showSearchBar ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}
          >
            <ChatList
              chats={chats}
              styles={styles}
              selectedChatId={selectedChatId || ''}
              onChatSelect={handleChatSelect}
              onScroll={handleChatListScroll}
              onSearch={async (query: string) => {
                setIsSearching(true);
                try {
                  const response = await chatService.searchUsers(query);
                  setSearchResults(response.data ?? response.items ?? []);
                  return response;
                } catch {
                  setSearchResults([]);
                  return { data: [], total: 0, page: 1, limit: 20, hasMore: false };
                } finally {
                  setIsSearching(false);
                }
              }}
              onNewChat={() => setShowNewChat(true)}
              onCreateGroup={() => setShowCreateGroup(true)}
              onUserSelect={handleUserSelect}
              currentUserId={currentUserId}
              setMessages={() => { }}
              setChats={() => { }}
            />
          </div>
          <div
            className={`absolute inset-0 top-0 bg-white dark:bg-[#202c33] z-10 transition-transform duration-300 ${showSearchBar ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
          >
            <div className="flex items-center space-x-2 p-4 border-b border-gray-200 dark:border-[#2a3942] bg-white dark:bg-[#202c33]">
              <button
                onClick={() => {
                  setShowSearchBar(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a3942]"
                title="Back"
              >
                <FiArrowLeft size={20} />
              </button>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  if (query.trim()) {
                    setIsSearching(true);
                  } else {
                    setSearchResults([]);
                    setIsSearching(false);
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2c3e50] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="p-2">
              {searchQuery ? (
                isSearching ? (
                  <div className="text-center py-2 text-gray-500 dark:text-gray-400">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a3942]"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name || (user.firstName + ' ' + user.lastName)} className="w-full h-full rounded-full" />
                          ) : (
                            <FiUser size={20} className="text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left items-start">
                          <div className="font-medium text-gray-900 dark:text-white w-full whitespace-normal break-words text-left">{user.name || (user.firstName + ' ' + user.lastName)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 w-full whitespace-normal break-words text-left">{user.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-gray-500 dark:text-gray-400">No users found</div>
                )
              ) : null}
            </div>
          </div>
        </div>
        {showCreateGroup && (
          <CreateGroupModal
            onClose={() => setShowCreateGroup(false)}
            onCreateGroup={async (params) => {
              try {
                let newGroup;
                if (params.avatar) {
                  const formData = new FormData();
                  formData.append('name', params.name);
                  if (params.description) formData.append('description', params.description);
                  formData.append('creatorId', currentUser?.id || '');
                  formData.append('participants', JSON.stringify(params.participants));
                  if (params.settings) formData.append('settings', JSON.stringify(params.settings));
                  formData.append('avatar', params.avatar);
                  newGroup = await chatMutations.createGroupChatWithAvatar.mutateAsync(formData);
                } else {
                  const { avatar, ...paramsWithoutAvatar } = params;
                  newGroup = await chatMutations.createGroupChat.mutateAsync({ ...paramsWithoutAvatar, creatorId: currentUser?.id || '' });
                }
                setSelectedChatId(newGroup.id);
                setAllMessages([]);
                setMessagesPage(1);
                setHasMoreMessages(true);
                setReplyToMessage(null);
                setShowCreateGroup(false);
              } catch (error) {
                console.error('ChatComponent: Error in onCreateGroup', error);
                toast.error('Failed to create group');
              }
            }}
            onSearch={async (query: string) => {
              setIsSearching(true);
              try {
                const response = await chatService.searchUsers(query);
                setSearchResults(response.data ?? response.items ?? []);
                return response;
              } catch {
                setSearchResults([]);
                return { data: [], total: 0, page: 1, limit: 20, hasMore: false };
              } finally {
                setIsSearching(false);
              }
            }}
          />
        )}
      </div>

      {/* Chat Messages/Main View */}
      <div
        className={`
          flex-1 flex flex-row h-full min-w-0
          ${showMobileChat ? 'flex' : 'hidden'}  // show on mobile if chat is open
          md:flex  // always show on desktop
        `}
      >
        <div className={`flex flex-col transition-all duration-300 min-w-0 w-full ${showGroupSettings ? 'md:w-2/3' : 'w-full'}`}>

          {selectedChatId && flatChat ? (
            <>
              <ChatHeader
                chat={flatChat}
                styles={styles}
                onInfoClick={() => setShowInfo(true)}
                onSettingsClick={() => setShowGroupSettings(true)}
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode((prev) => !prev)}
                onDeleteChat={handleDeleteChat}
                onBlock={handleBlock}
                onClearChat={handleClearChat}
                currentUserId={currentUserId || ''}
                isBlockedByMe={isBlockedByMe}
                isBlockedMe={isBlockedMe}
                onBack={showMobileChat ? handleMobileBack : undefined}
                onlineUsers={onlineUsers}
              />
              {isBlockedByMe && (
                <div className="text-red-500 text-center p-2">You blocked this user. Unblock to send messages.</div>
              )}
              {!isBlockedByMe && isBlockedMe && (
                <div className="text-red-500 text-center p-2">You are blocked and cannot send messages.</div>
              )}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" onScroll={handleScroll} ref={scrollRef}>
                {/* Debug button to force re-render */}

                {loadingMoreMessages && (
                  <div className="flex justify-center p-2">
                    <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-blue-500 rounded-full" />
                  </div>
                )}
                {isLoadingMessages && messagesPage === 1 && allMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full" />
                  </div>
                ) : visibleMessages.length > 0 ? (
                  visibleMessages.map((message: Message, index: number) => {
                    const isLast = index === visibleMessages.length - 1;
                    return (
                      <ChatMessage
                        key={message.id}
                        ref={isLast ? messagesEndRef : undefined}
                        message={message}
                        previousMessage={index > 0 ? visibleMessages[index - 1] : undefined}
                        styles={styles}
                        onDelete={handleDeleteMessage}
                        onReply={handleReplyToMessage}
                        onReplyClick={handleReplyClick}
                        currentUserId={currentUserId || ''}
                        participants={flatChat?.participants || []}
                        isGroup={flatChat?.type === 'group'}
                      />
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500 dark:text-gray-400">
                    <FiMessageSquare size={60} className="mb-4" />
                    <h2 className="text-xl font-semibold">No Messages Yet</h2>
                    <p>Start the conversation by sending a message.</p>
                  </div>
                )}
                {isTyping && <TypingIndicator styles={styles} />}
              </div>
              <ChatInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                styles={styles}
                replyToMessage={replyToMessage}
                onCancelReply={() => setReplyToMessage(null)}
                selectedChatId={selectedChatId || ''}
                currentUserId={currentUserId || ''}
                disabled={isBlockedByMe || isBlockedMe || !canSendMessages}
                disabledReason={inputDisabledReason}
              />
            </>
          ) : pendingUser ? (
            <>
              <ChatHeader
                chat={{
                  id: 'pending',
                  type: 'direct',
                  name: pendingUser.name || `${pendingUser.firstName || ''} ${pendingUser.lastName || ''}`.trim(),
                  avatar: pendingUser.avatar,
                  participants: [
                    {
                      id: pendingUser.id,
                      firstName: pendingUser.firstName || '',
                      lastName: pendingUser.lastName || '',
                      email: pendingUser.email,
                      avatar: pendingUser.avatar,
                      isOnline: pendingUser.isOnline || false,
                      name: pendingUser.name
                    }
                  ],
                  admins: [],
                  isAdmin: false,
                  settings: {
                    onlyAdminsCanPost: false,
                    onlyAdminsCanAddMembers: false,
                    onlyAdminsCanChangeInfo: false,
                    onlyAdminsCanPinMessages: false,
                    onlyAdminsCanSendMedia: true,
                    onlyAdminsCanSendLinks: true
                  },
                  unreadCount: 0,
                  updatedAt: new Date()
                }}
                styles={styles}
                onInfoClick={() => { }}
                onSettingsClick={() => { }}
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode((prev) => !prev)}
                onDeleteChat={() => { }}
                onBlock={() => { }}
                onClearChat={() => { }}
                currentUserId={currentUserId || ''}
                isBlockedByMe={false}
                isBlockedMe={false}
                onBack={showMobileChat ? handleMobileBack : undefined}
                onlineUsers={onlineUsers}
              />
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 md:p-8 bg-gray-50 dark:bg-gray-800/50">
                <div className="relative mb-6">
                  {pendingUser.avatar ? (
                    <img
                      src={pendingUser.avatar}
                      alt={pendingUser.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-[#2a3942] shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      {pendingUser.firstName?.[0] || pendingUser.name?.[0] || 'U'}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-[#2a3942]"></div>
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {pendingUser.name || `${pendingUser.firstName} ${pendingUser.lastName}`}
                </h2>
                <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-sm px-4">
                  Say hi to {pendingUser.firstName || pendingUser.name}! Start the conversation by sending a message.
                </p>
                <div className="flex flex-col items-center space-y-2 opacity-50">
                  <FiMessageSquare size={32} className="text-blue-500 animate-bounce" />
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-[#2a3942] p-4">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  styles={styles}
                  replyToMessage={replyToMessage}
                  onCancelReply={() => setReplyToMessage(null)}
                  selectedChatId={''}
                  currentUserId={currentUserId || ''}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8 bg-gray-50 dark:bg-gray-800/50">
              <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full mb-4 md:mb-6">
                <FiMessageSquare size={48} className="md:w-[60px] md:h-[60px] text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200">Welcome to Chat</h2>
              <p className="text-sm md:text-md text-gray-500 dark:text-gray-400 mt-2 max-w-sm px-2">
                Select a conversation from the list on the left, or start a new one to begin messaging.
              </p>
            </div>
          )}
        </div>
        {/* Group Settings Modal: Desktop sidebar and Mobile full-screen overlay */}
        {showGroupSettings && flatChat && currentUser && (
          <React.Fragment>
            {/* Desktop: Sidebar */}
            <div className="hidden md:block w-1/3 h-full border-l border-gray-200 dark:border-[#2a3942] bg-white dark:bg-[#1f2937] shadow-lg transition-all duration-300">
              <GroupSettingsModal
                onClose={() => setShowGroupSettings(false)}
                chat={flatChat}
                currentUser={currentUser}
                onUpdateGroup={handleUpdateGroup}
                onAddMembers={() => { }}
                onRemoveMember={handleRemoveMember}
                onMakeAdmin={handleMakeAdmin}
                onRemoveAdmin={handleRemoveAdmin}
                onLeaveGroup={handleLeaveGroup}
                onDeleteGroup={handleDeleteGroup}
              />
            </div>
            {/* Mobile: Full-width overlay */}
            {showMobileChat && (
              <div className="fixed inset-0 z-50 bg-white dark:bg-[#1f2937] w-full h-full md:hidden overflow-y-auto transition-all duration-300">
                {/* Mobile-only back button header */}
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-[#2a3942] bg-white dark:bg-[#202c33] md:hidden">
                  <button
                    onClick={() => setShowGroupSettings(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a3942]"
                    title="Back"
                  >
                    <FiArrowLeft size={24} />
                  </button>
                  <span className="ml-4 text-lg font-semibold">Group Settings</span>
                </div>
                <GroupSettingsModal
                  onClose={() => setShowGroupSettings(false)}
                  chat={flatChat}
                  currentUser={currentUser}
                  onUpdateGroup={handleUpdateGroup}
                  onAddMembers={() => { }}
                  onRemoveMember={handleRemoveMember}
                  onMakeAdmin={handleMakeAdmin}
                  onRemoveAdmin={handleRemoveAdmin}
                  onLeaveGroup={handleLeaveGroup}
                  onDeleteGroup={handleDeleteGroup}
                />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};