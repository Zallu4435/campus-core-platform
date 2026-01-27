import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../appStore/store';
import { Message, User } from '../../../../../domain/types/canvas/chat';
import { useQueryClient } from '@tanstack/react-query';

export const useChatSocket = (selectedChatId: string | null) => {
    const [socketError, setSocketError] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const socketRef = useRef<Socket | null>(null);
    const currentUser = useSelector((state: RootState) => state.auth.user);
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
        if (!socketRef.current) return;
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

        socketRef.current.on('userStatus', handleUserStatus);
        socketRef.current.on('onlineUsers', handleOnlineUsers);

        return () => {
            socketRef.current?.off('userStatus', handleUserStatus);
            socketRef.current?.off('onlineUsers', handleOnlineUsers);
        };
    }, []);

    useEffect(() => {
        if (!socketRef.current || !selectedChatId) return;
        socketRef.current.emit('joinChat', { chatId: selectedChatId });
        return () => {
            socketRef.current?.emit('leaveChat', { chatId: selectedChatId });
        };
    }, [selectedChatId]);

    // Message handling
    useEffect(() => {
        if (!socketRef.current || !currentUser?.id) return;

        const handleNewMessage = (message: Message) => {
            // Logic to update local cache provided by consumer 
            // OR we just invalidate queries.
            // For now, let's just invalidate queries to be safe and simple
            if (message.chatId === selectedChatId) {
                // In a real optimized app we'd update the cache manually here
                // but let's stick to invalidating for correctness first
            }
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        };

        const handleChatUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        };

        socketRef.current.on('message', handleNewMessage);
        socketRef.current.on('chat', handleChatUpdate);

        return () => {
            socketRef.current?.off('message', handleNewMessage);
            socketRef.current?.off('chat', handleChatUpdate);
        };
    }, [selectedChatId, currentUser?.id, queryClient]);


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
