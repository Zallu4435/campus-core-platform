import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../../../../../domain/types/canvas/chat';
import { useQueryClient } from '@tanstack/react-query';

export const useChatSocket = (
    selectedChatId: string | null,
    callbacks?: {
        onChatDeleted?: (data: { chatId: string, initiatorId?: string }) => void;
        onParticipantRemoved?: (data: { chatId: string, initiatorId?: string }) => void;
        onChatBlocked?: (data: { chatId: string, blockerId: string, blockedId: string, isBlocked: boolean, initiatorId?: string }) => void;
        onGroupUpdated?: (data: any & { initiatorId?: string }) => void;
    }
) => {
    const [socketError, setSocketError] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const socketRef = useRef<Socket | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const socketUrl = apiBaseUrl.replace('/api', '') + '/chat';

        const socket = io(socketUrl, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });
        socketRef.current = socket;

        socket.on('connect_error', (err) => {
            setSocketError('Socket connection error: ' + (err.message || err));
            console.error('[Socket.IO] Connection error:', err);
        });

        socket.on('connect', () => {
            setSocketError(null);
        });

        socket.on('disconnect', (reason) => {
            console.warn('[Socket.IO] Disconnected:', reason);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!socketRef.current || !selectedChatId) return;
        socketRef.current.emit('joinChat', { chatId: selectedChatId });
        return () => {
            socketRef.current?.emit('leaveChat', { chatId: selectedChatId });
        };
    }, [selectedChatId]);

    useEffect(() => {
        if (!socketRef.current) return;

        const socket = socketRef.current;

        const handleUserStatus = (data: { userId: string; status: 'online' | 'offline' }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (data.status === 'online') {
                    newSet.add(data.userId);
                } else {
                    newSet.delete(data.userId);
                }
                return newSet;
            });
        };

        const handleOnlineUsers = (userIds: string[]) => {
            setOnlineUsers(new Set(userIds));
        };

        socket.on('userStatus', handleUserStatus);
        socket.on('onlineUsers', handleOnlineUsers);

        return () => {
            socket.off('userStatus', handleUserStatus);
            socket.off('onlineUsers', handleOnlineUsers);
        };
    }, []);

    useEffect(() => {
        if (!socketRef.current) return;

        const socket = socketRef.current;

        const handleNewMessage = (message: Message) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });

            if (message.chatId) {
                queryClient.invalidateQueries({ queryKey: ['messages', message.chatId] });
            }

            if (message.chatId === selectedChatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', selectedChatId] });
            }
        };

        const handleChatUpdate = (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            const updatedChatId = data?.id || data?.chat?.id || selectedChatId;
            if (updatedChatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', updatedChatId] });
                queryClient.invalidateQueries({ queryKey: ['messages', updatedChatId] });
            }
        };

        const handleChatDeleted = (data: { chatId: string, initiatorId?: string }) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            const deletedChatId = data?.chatId || selectedChatId;
            if (deletedChatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', deletedChatId] });
            }
            if (callbacks?.onChatDeleted && deletedChatId) {
                callbacks.onChatDeleted({ chatId: deletedChatId, initiatorId: data.initiatorId });
            }
        };

        const handleParticipantRemoved = (data: { chatId: string, initiatorId?: string }) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            if (data.chatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', data.chatId] });
            }
            if (callbacks?.onParticipantRemoved) {
                callbacks.onParticipantRemoved(data);
            }
        };

        const handleChatBlocked = (data: { chatId: string, blockerId: string, blockedId: string, isBlocked: boolean }) => {
            queryClient.invalidateQueries({ queryKey: ['chat', data.chatId] });
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            if (callbacks?.onChatBlocked) {
                callbacks.onChatBlocked(data);
            }
        };

        const handleGroupUpdated = (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            if (data.chatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', data.chatId] });
                queryClient.invalidateQueries({ queryKey: ['messages', data.chatId] });
            }
            if (callbacks?.onGroupUpdated) {
                callbacks.onGroupUpdated(data);
            }
        };

        const handleMessagesCleared = (data: { chatId: string }) => {
            queryClient.invalidateQueries({ queryKey: ['messages', data.chatId] });
            if (data.chatId === selectedChatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', selectedChatId] });
            }
        };

        const handleMessagesRead = (data: { chatId: string; userId: string }) => {
            if (data.chatId === selectedChatId) {
                queryClient.invalidateQueries({ queryKey: ['messages', selectedChatId] });
                queryClient.invalidateQueries({ queryKey: ['chat', selectedChatId] });
            }
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        };

        const handleMessageStatus = (data: { messageId: string; chatId: string; status: string }) => {
            if (data.chatId === selectedChatId) {
                queryClient.invalidateQueries({ queryKey: ['messages', selectedChatId] });
            }
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        };

        socket.on('message', handleNewMessage);
        socket.on('chat', handleChatUpdate);
        socket.on('chatDeleted', handleChatDeleted);
        socket.on('participantRemoved', handleParticipantRemoved);
        socket.on('chatBlocked', handleChatBlocked);
        socket.on('groupUpdated', handleGroupUpdated);
        socket.on('messagesCleared', handleMessagesCleared);
        socket.on('messagesRead', handleMessagesRead);
        socket.on('messageStatus', handleMessageStatus);

        return () => {
            socket.off('message', handleNewMessage);
            socket.off('chat', handleChatUpdate);
            socket.off('chatDeleted', handleChatDeleted);
            socket.off('participantRemoved', handleParticipantRemoved);
            socket.off('chatBlocked', handleChatBlocked);
            socket.off('groupUpdated', handleGroupUpdated);
            socket.off('messagesCleared', handleMessagesCleared);
            socket.off('messagesRead', handleMessagesRead);
            socket.off('messageStatus', handleMessageStatus);
        };
    }, [selectedChatId, queryClient]);


    const emitTyping = useCallback((isTyping: boolean) => {
        if (!selectedChatId || !socketRef.current) return;
        socketRef.current.emit('typing', { chatId: selectedChatId, isTyping });
    }, [selectedChatId]);

    return {
        socketRef,
        socketError,
        onlineUsers,
        emitTyping
    };
};
