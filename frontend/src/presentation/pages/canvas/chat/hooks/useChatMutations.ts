import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';

export const useChatMutations = (chatId?: string, currentUserId?: string) => {
  const queryClient = useQueryClient();

  const requireIds = () => {
    if (!chatId || !currentUserId) throw new Error('chatId and currentUserId are required');
  };

  const addGroupMember = useMutation({
    mutationFn: async (userId: string) => {
      requireIds();
      return chatService.addGroupMember(chatId!, userId, currentUserId!);
    },
    onError: (error: Error) => {
      if (error.message.includes('Only admins')) {
        console.error('Permission denied:', error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const removeGroupMember = useMutation({
    mutationFn: async (userId: string) => {
      requireIds();
      return chatService.removeGroupMember(chatId!, userId, currentUserId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const updateGroupAdmin = useMutation({
    mutationFn: async (params: { userId: string; isAdmin: boolean }) => {
      requireIds();
      return chatService.updateGroupAdmin(chatId!, params.userId, params.isAdmin, currentUserId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    }
  });

  const updateGroupSettings = useMutation({
    mutationFn: async (settings: { onlyAdminsCanPost?: boolean; onlyAdminsCanAddMembers?: boolean; onlyAdminsCanChangeInfo?: boolean; onlyAdminsCanPinMessages?: boolean; onlyAdminsCanSendMedia?: boolean; onlyAdminsCanSendLinks?: boolean }) => {
      requireIds();
      return chatService.updateGroupSettings(chatId!, settings, currentUserId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    }
  });

  const updateGroupInfo = useMutation({
    mutationFn: async (info: { name?: string; description?: string; avatar?: string }) => {
      requireIds();
      return chatService.updateGroupInfo(chatId!, info, currentUserId!);
    },
    onError: (error: Error) => {
      if (error.message.includes('Only admins')) {
        console.error('Permission denied:', error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const leaveGroup = useMutation({
    mutationFn: async () => {
      requireIds();
      return chatService.leaveGroup(chatId!, currentUserId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  // Chat mutations
  const createChat = useMutation({
    mutationFn: chatService.createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const createGroupChat = useMutation({
    mutationFn: chatService.createGroupChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const createGroupChatWithAvatar = useMutation({
    mutationFn: chatService.createGroupChatWithAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const sendMessage = useMutation({
    mutationFn: async (params: { chatId: string; content: string; type?: string; replyTo?: { id: string; content: string; senderId: string; senderName: string; type: string; createdAt: string } }) =>
      chatService.sendMessage(
        params.chatId,
        params.content,
        params.type as 'text' | 'image' | 'file' | 'audio' | 'video' | undefined,
        params.replyTo
      ),
    onError: (error: Error) => {
      if (error.message.includes('Only admins')) {
        // Permission error - already shown in UI, but provide toast for attempts
        console.error('Permission denied:', error.message);
      }
    },
    onSettled: (_data, _error, params) => {
      queryClient.invalidateQueries({ queryKey: ['messages', params?.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const sendFile = useMutation({
    mutationFn: (params: { chatId: string; formData: FormData; file: File; replyTo?: { id: string; content: string; senderId: string; senderName: string; type: string; createdAt: string } }) =>
      chatService.sendFile(params.chatId, params.formData, params.replyTo),
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (params: { chatId: string; messageId: string; deleteForEveryone: boolean }) =>
      chatService.deleteMessage(params.chatId, params.messageId, params.deleteForEveryone),
    onSettled: (_data, _error, params) => {
      queryClient.invalidateQueries({ queryKey: ['messages', params?.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const editMessage = useMutation({
    mutationFn: async (params: { chatId: string; messageId: string; newContent: string }) =>
      chatService.editMessage(params.chatId, params.messageId, params.newContent),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ['messages', params.chatId] });
    }
  });

  const replyToMessage = useMutation({
    mutationFn: async (params: { chatId: string; replyToId: string; content: string }) =>
      chatService.replyToMessage(params.chatId, params.replyToId, params.content),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ['messages', params.chatId] });
    }
  });

  const addReaction = useMutation({
    mutationFn: async (params: { messageId: string; emoji: string }) => {
      if (!currentUserId) throw new Error('User not authenticated');
      return chatService.addReaction(params.messageId, params.emoji, currentUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const removeReaction = useMutation({
    mutationFn: async (params: { messageId: string }) => {
      if (!currentUserId) throw new Error('User not authenticated');
      return chatService.removeReaction(params.messageId, currentUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const markMessagesAsRead = useMutation({
    mutationFn: async (chatId: string) => chatService.markMessagesAsRead(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const deleteChat = useMutation({
    mutationFn: async (chatId: string) => chatService.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const blockChat = useMutation({
    mutationFn: async (chatId: string) => chatService.blockChat(chatId),
    onSuccess: (_data, chatId) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    }
  });

  const clearChat = useMutation({
    mutationFn: async (chatId: string) => chatService.clearChat(chatId),
    onSuccess: (_data, chatId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    }
  });

  const toggleMute = useMutation({
    mutationFn: async (chatId: string) => chatService.toggleMute(chatId),
    onSuccess: (_data, chatId) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    }
  });

  return {
    // Group mutations
    addGroupMember,
    removeGroupMember,
    updateGroupAdmin,
    updateGroupSettings,
    updateGroupInfo,
    leaveGroup,

    // Chat mutations
    createChat,
    createGroupChat,
    createGroupChatWithAvatar,
    deleteChat,
    blockChat,
    clearChat,

    // Message mutations
    sendMessage,
    sendFile,
    deleteMessage,
    editMessage,
    replyToMessage,
    addReaction,
    removeReaction,
    markMessagesAsRead,
    toggleMute,
  };
}; 