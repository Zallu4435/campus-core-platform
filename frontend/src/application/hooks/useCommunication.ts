import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '../../application/services/communicationService';
import debounce from 'lodash/debounce';
import { Message, MessageForm, UseCommunicationManagementProps } from '../../domain/types/user/communication';
import { RecipientType, User } from '../../domain/types/management/communicationmanagement';


export const useCommunicationManagement = ({
  isAdmin = false,
  fetchInbox = true,
  fetchSent = true
}: UseCommunicationManagementProps = {}) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'All Statuses',
    to: 'All Recipients',
    search: '',
  });
  const queryClient = useQueryClient();

  const ITEMS_PER_PAGE = 10;

  const inboxQuery = useQuery({
    queryKey: ['inboxMessages', page, filters, isAdmin],
    queryFn: () =>
      communicationService.getInboxMessages({
        page,
        limit: ITEMS_PER_PAGE,
        search: filters.search || undefined,
        status: filters.status !== 'All Statuses' ? (filters.status.toLowerCase() as 'read' | 'unread') : undefined,
        isAdmin,
      }),
    enabled: fetchInbox,
  });

  const sentQuery = useQuery({
    queryKey: ['sentMessages', page, filters, isAdmin],
    queryFn: () =>
      communicationService.getSentMessages({
        page,
        limit: ITEMS_PER_PAGE,
        search: filters.search || undefined,
        status:
          filters.status !== 'All Statuses'
            ? (filters.status.toLowerCase() as 'read' | 'unread' | 'delivered' | 'opened')
            : undefined,
        to: filters.to !== 'All Recipients' ? filters.to : undefined,
        isAdmin,
      }),
    enabled: fetchSent,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (form: MessageForm) => communicationService.sendMessage(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentMessages'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => communicationService.markAsRead(messageId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inboxMessages'] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => communicationService.deleteMessage(messageId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inboxMessages'] });
      queryClient.invalidateQueries({ queryKey: ['sentMessages'] });
    },
  });

  const handleSendMessage = (form: MessageForm) => {
    sendMessageMutation.mutate({ ...form, isAdmin });
  };

  const handleReplyMessage = (message: Message) => {
    if (!message.sender || !message.sender.id || !message.sender.name) {
      return;
    }
    sendMessageMutation.mutate({
      to: [{ value: message.sender.id, label: message.sender.name }],
      subject: `Re: ${message.subject}`,
      message: '',
      isAdmin,
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessageMutation.mutate(messageId);
  };

  const handleArchiveMessage = (message: Message) => {
    console.log('Archiving message:', message);
  };

  const handleViewMessage = (messageId: string) => {
    markAsReadMutation.mutate(messageId);
  };

  const fetchSentMessages = () => {
    sentQuery.refetch();
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPage(1);
    }, 500),
    []
  );

  const debouncedFilterChange = useCallback(
    debounce((field: string, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
      setPage(1);
    }, 500),
    []
  );

  const mapMessage = useCallback((msg: any) => {
    try {
      const messageId = msg._id || msg.id || (msg._id && msg._id.toString()) || (msg.id && msg.id.toString());

      if (!messageId) {
        console.error('Message missing ID:', msg);
        return null;
      }

      let sender = undefined;
      if (msg.sender) {
        sender = {
          id: msg.sender._id || msg.sender.id,
          name: msg.sender.name || 'Unknown',
          email: msg.sender.email || 'unknown@email.com',
          role: msg.sender.role || 'unknown',
        };
      }

      let recipients = [];
      if (typeof msg.recipients === 'string') {
        recipients = [{
          id: 'recipient',
          name: msg.recipients,
          email: msg.recipients,
          role: 'recipient',
          status: 'read'
        }];
      } else if (Array.isArray(msg.recipients)) {
        recipients = msg.recipients.map((recipient: any) => ({
          id: recipient._id || recipient.id || 'recipient',
          name: recipient.name || 'Unknown',
          email: recipient.email || 'unknown@email.com',
          role: recipient.role || 'unknown',
          status: (recipient.status || 'read') as 'read' | 'unread'
        }));
      }

      const mappedMessage = {
        id: messageId,
        subject: msg.subject || 'No Subject',
        content: msg.content || 'No Content',
        sender,
        recipients,
        attachments: msg.attachments || [],
        isBroadcast: msg.isBroadcast || false,
        createdAt: msg.createdAt || new Date().toISOString(),
        updatedAt: msg.updatedAt || new Date().toISOString(),
        status: (msg.status || 'read') as 'read' | 'unread' | 'delivered' | 'opened',
        recipientsCount: msg.recipientCount || recipients.length
      };
      return mappedMessage;
    } catch (error) {
      console.error('Error mapping message:', error, msg);
      return null;
    }
  }, []);

  const fetchUsers = useCallback(async (type: RecipientType, search?: string): Promise<User[]> => {
    try {
      if (!type) {
        return [];
      }
      const users = await communicationService.fetchUsers(type, search);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }, []);

  const handleSendMessageCallback = useCallback(async (form: MessageForm) => {
    try {
      const message = await communicationService.sendMessage(form);
      sentQuery.refetch();
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [sentQuery]);

  const handleViewMessageCallback = useCallback(async (message: Message) => {
    try {
      await communicationService.markAsRead(message.id, isAdmin);
      inboxQuery.refetch();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [inboxQuery, isAdmin]);

  const handleDeleteMessageCallback = useCallback(async (messageId: string, type: 'inbox' | 'sent') => {
    try {
      await communicationService.deleteMessage(messageId, isAdmin);
      if (type === 'inbox') {
        inboxQuery.refetch();
      } else {
        sentQuery.refetch();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }, [inboxQuery, sentQuery, isAdmin]);

  const loadInboxMessages = useCallback(async () => {
    try {
      await communicationService.getInboxMessages({
        page,
        limit: ITEMS_PER_PAGE,
        search: filters.search || undefined,
        status: filters.status !== 'All Statuses' ? (filters.status.toLowerCase() as 'read' | 'unread') : undefined,
        isAdmin,
      });
      inboxQuery.refetch();
    } catch (error) {
      console.error('Error loading inbox messages:', error);
    }
  }, [inboxQuery, page, filters, isAdmin]);

  const loadSentMessages = useCallback(async () => {
    try {
      await communicationService.getSentMessages({
        page,
        limit: ITEMS_PER_PAGE,
        search: filters.search || undefined,
        status:
          filters.status !== 'All Statuses'
            ? (filters.status.toLowerCase() as 'read' | 'unread' | 'delivered' | 'opened')
            : undefined,
        to: filters.to !== 'All Recipients' ? filters.to : undefined,
        isAdmin,
      });
      sentQuery.refetch();
    } catch (error) {
      console.error('Error loading sent messages:', error);
    }
  }, [sentQuery, page, filters, isAdmin]);

  return {
    inboxMessages: (inboxQuery.data?.messages || []).map(mapMessage).filter(Boolean) as Message[],
    sentMessages: (sentQuery.data?.messages || []).map(mapMessage).filter(Boolean) as Message[],
    totalInboxPages: inboxQuery.data?.pagination.totalPages || 1,
    totalSentPages: sentQuery.data?.pagination.totalPages || 1,
    isLoadingInbox: inboxQuery.isLoading,
    isLoadingSent: sentQuery.isLoading,
    page,
    setPage,
    filters,
    setFilters,
    handleSendMessage,
    handleReplyMessage,
    handleDeleteMessage,
    handleArchiveMessage,
    handleViewMessage,
    fetchSentMessages,
    debouncedSearch,
    debouncedFilterChange,
    fetchUsers,
    handleSendMessageCallback,
    handleViewMessageCallback,
    handleDeleteMessageCallback,
    loadInboxMessages,
    loadSentMessages,
  };
};