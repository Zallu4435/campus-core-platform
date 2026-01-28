import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../../../../../domain/types/canvas/chat';
import { useQueryClient } from '@tanstack/react-query';

export const useChatSocket = (selectedChatId: string | null) => {
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
            const updatedChatId = data?.id || selectedChatId;
            if (updatedChatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', updatedChatId] });
            }
        };

        const handleChatDeleted = () => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            if (selectedChatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', selectedChatId] });
            }
        };

        const handleMessagesCleared = (data: { chatId: string }) => {
            queryClient.invalidateQueries({ queryKey: ['messages', data.chatId] });
            if (data.chatId === selectedChatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', selectedChatId] });
            }
        };

        socket.on('message', handleNewMessage);
        socket.on('chat', handleChatUpdate);
        socket.on('chatDeleted', handleChatDeleted);
        socket.on('messagesCleared', handleMessagesCleared);

        return () => {
            socket.off('message', handleNewMessage);
            socket.off('chat', handleChatUpdate);
            socket.off('chatDeleted', handleChatDeleted);
            socket.off('messagesCleared', handleMessagesCleared);
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
