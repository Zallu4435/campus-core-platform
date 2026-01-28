
import React from 'react';

export interface User {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away';
    lastSeen?: Date;
    firstName?: string;
    lastName?: string;
    isOnline?: boolean;
}

export interface Attachment {
    id?: string;
    type: 'image' | 'document' | 'audio' | 'video' | 'file';
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
}

export interface Reaction {
    id?: string;
    emoji: string;
    userId: string;
    userName?: string;
    createdAt?: string;
    count?: number;
}

export interface ReplyTo {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    type: 'text' | 'document' | 'image' | 'audio' | 'video' | 'file';
    createdAt: string;
}

export interface ForwardedFrom {
    id: string;
    chatId: string;
    chatName: string;
}

export interface Message {
    id: string;
    _id?: string;
    chatId: string;
    senderId: string;
    senderName: string;
    content: string;
    type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'file';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    isEdited?: boolean;
    replyToId?: string;
    replyTo?: ReplyTo;
    forwardedFrom?: ForwardedFrom;
    reactions: Reaction[];
    status: 'sending' | 'delivered' | 'read' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    deletedFor?: string[];
    isDeleted?: boolean;
    deletedForEveryone?: boolean;
    time?: string;
    attachments?: {
        id?: string;
        type: 'image' | 'document' | 'audio' | 'video' | 'file';
        url: string;
        name: string;
        size?: number;
        mimeType?: string;
    }[];
}

export interface LastMessage {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    type: 'text' | 'document' | 'image' | 'audio' | 'video' | 'file';
    status: 'sending' | 'delivered' | 'read' | 'failed';
    createdAt: string;
}

export interface GroupInfo {
    description?: string;
    rules?: string;
    joinLink?: string;
    settings: {
        onlyAdminsCanPost: boolean;
        onlyAdminsCanAddMembers: boolean;
        onlyAdminsCanChangeInfo: boolean;
    };
}

export interface Participant {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    name?: string;
}

export interface Chat {
    id: string;
    type: 'direct' | 'group';
    name: string;
    avatar?: string;
    description?: string;
    participants: Participant[];
    admins: string[];
    isAdmin: boolean;
    lastMessage?: {
        id: string;
        content: string;
        type: string;
        senderId: string;
        status: string;
        createdAt: Date;
    };
    settings: {
        onlyAdminsCanPost: boolean;
        onlyAdminsCanAddMembers: boolean;
        onlyAdminsCanChangeInfo: boolean;
        onlyAdminsCanPinMessages: boolean;
        onlyAdminsCanSendMedia: boolean;
        onlyAdminsCanSendLinks: boolean;
    };
    unreadCount: number;
    updatedAt: Date;
    blockedUsers?: { blocker: string; blocked: string }[];
}

export interface PaginatedResponse<T> {
    data: T[];
    messages?: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    items?: T[];
}

export interface Styles {
    background: (isDarkMode: boolean) => string;
    backgroundSecondary: (isDarkMode: boolean) => string;
    card: {
        background: (isDarkMode: boolean) => string;
        hover: (isDarkMode: boolean) => string;
    };
    text: {
        primary: (isDarkMode: boolean) => string;
        secondary: (isDarkMode: boolean) => string;
        muted: (isDarkMode: boolean) => string;
    };
    border: (isDarkMode: boolean) => string;
    borderSecondary: (isDarkMode: boolean) => string;
    input: {
        background: (isDarkMode: boolean) => string;
        border: (isDarkMode: boolean) => string;
        focus: (isDarkMode: boolean) => string;
    };
    button: {
        primary: (isDarkMode: boolean) => string;
        secondary: (isDarkMode: boolean) => string;
    };
    message: {
        sent: (isDarkMode: boolean) => string;
        received: (isDarkMode: boolean) => string;
    };
    accent: (isDarkMode: boolean) => string;
}


export interface AttachmentMenuProps {
    styles: Styles;
    showAttachmentMenu: boolean;
    onFileSelect: () => void;
    onClose: () => void;
}

export interface AudioPlayerProps {
    src: string;
}

export interface ChatHeaderProps {
    chat: Chat;
    styles: Styles;
    onInfoClick: () => void;
    onSettingsClick: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onDeleteChat: () => void;
    onBlock: () => void;
    onClearChat: () => void;
    currentUserId: string;
    isBlockedByMe: boolean;
    isBlockedMe: boolean;
    onBack?: () => void;
    onlineUsers: Set<string>;
}

export interface ChatInfoProps {
    chat: Chat;
    styles: Styles;
    onClose: () => void;
    onDeleteChat: (chatId: string) => void;
    onAddMembers: (chatId: string) => void;
}


export interface ChatInputProps {
    onSendMessage: (message: string, fileOrFiles?: File | File[], replyTo?: Message) => void;
    onTyping: (isTyping: boolean) => void;
    styles: Styles;
    replyToMessage?: Message | null;
    onCancelReply?: () => void;
    selectedChatId: string | null;
    currentUserId: string;
}

export interface ChatListProps {
    chats: Chat[];
    styles: Styles;
    selectedChatId: string;
    onChatSelect: (chatId: string) => void;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    onSearch: (query: string) => Promise<PaginatedResponse<User>>;
    onNewChat: () => void;
    onCreateGroup: () => void;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    onUserSelect: (user: User) => void;
    currentUserId: string | undefined;
}

export interface ChatMessageProps {
    message: Message;
    currentUserId: string;
    previousMessage?: Message;
    onReply: (message: Message) => void;
    onDelete: (messageId: string, deleteForEveryone: boolean) => void;
    onReplyClick?: (messageId: string) => void;
    styles: Styles;
}

export interface CreateGroupModalProps {
    onClose: () => void;
    onCreateGroup: (params: {
        name: string;
        description?: string;
        participants: string[];
        settings?: {
            onlyAdminsCanPost?: boolean;
            onlyAdminsCanAddMembers?: boolean;
            onlyAdminsCanChangeInfo?: boolean;
            onlyAdminsCanPinMessages?: boolean;
            onlyAdminsCanSendMedia?: boolean;
            onlyAdminsCanSendLinks?: boolean;
        };
        avatar?: File;
    }) => void;
    onSearch: (query: string) => Promise<PaginatedResponse<User>>;
}

export interface DeleteMessageModalProps {
    isVisible: boolean;
    isSentMessage: boolean;
    onClose: () => void;
    onDeleteForMe: () => void;
    onDeleteForEveryone?: () => void;
}

export interface EmojiPickerProps {
    styles: Styles;
    show: boolean;
    onEmojiSelect: (emoji: string) => void;
    onClose: () => void;
    position?: 'top' | 'bottom';
}

export interface GroupSettingsModalProps {
    onClose: () => void;
    chat: Chat;
    currentUser: User;
    onUpdateGroup: (updates: {
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
    }) => void;
    onAddMembers: () => void;
    onRemoveMember: (userId: string) => void;
    onMakeAdmin: (userId: string) => void;
    onRemoveAdmin: (userId: string) => void;
    onLeaveGroup: () => void;
    onDeleteGroup: () => void;
}

export interface ImagePreviewModalProps {
    imageUrl: string;
    onClose: () => void;
}

export interface LiveWaveformProps {
    stream: MediaStream | null;
    isRecording: boolean;
}



export interface MediaPreviewProps {
    message: Message;
    onClose: () => void;
    styles?: unknown;
    onAddMore?: () => void;
    onRemoveMedia?: (index: number) => void;
    onSendMedia?: (media: { url: string; name: string; type: string; caption: string }[]) => void;
}

export type Tool = 'none' | 'rotate' | 'draw' | 'text' | 'rect' | 'blur' | 'emoji' | 'crop';

export interface TextElement {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
    background: string;
    isEditing: boolean;
}

export interface RectElement {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    thickness: number;
    fill: boolean;
}

export interface BlurArea {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface EmojiElement {
    id: string;
    x: number;
    y: number;
    emoji: string;
    size: number;
}

export interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface MessageDropdownProps {
    message: Message;
    currentUserId: string;
    isVisible: boolean;
    onClose: () => void;
    onReact: () => void;
    onReply: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onShowDeleteOptions: () => void;
}




export interface MessageReactionsModalProps {
    isVisible: boolean;
    onClose: () => void;
    reactions: Reaction[];
    currentUserId: string;
    onAddReaction: (emoji: string) => void;
    onRemoveReaction: (emoji: string) => void;
    position?: { x: number; y: number };
}

export interface MessageStatusProps {
    status: 'sending' | 'delivered' | 'read';
}

export interface TypingIndicatorProps {
    styles: Styles;
}

export interface ChatMutations {
    markMessagesAsRead: { mutateAsync: (chatId: string) => Promise<void> };
    editMessage: { mutateAsync: (params: { chatId: string; messageId: string; newContent: string }) => Promise<void> };
    deleteMessage: { mutateAsync: (params: { chatId: string; messageId: string; deleteForEveryone: boolean }) => Promise<void> };
    addReaction: { mutateAsync: (params: { messageId: string; emoji: string; userId: string }) => Promise<void> };
    removeReaction: { mutateAsync: (params: { messageId: string; userId: string }) => Promise<void> };
    updateGroupSettings: { mutateAsync: (params: { chatId: string; updates: { name?: string; description?: string; settings?: { onlyAdminsCanPost?: boolean; onlyAdminsCanAddMembers?: boolean; onlyAdminsCanChangeInfo?: boolean; onlyAdminsCanPinMessages?: boolean; onlyAdminsCanSendMedia?: boolean; onlyAdminsCanSendLinks?: boolean; } } }) => Promise<void> };
    addGroupMember: { mutateAsync: (params: { userId: string }) => Promise<void> };
    removeGroupMember: { mutateAsync: (params: { userId: string }) => Promise<Chat> };
    updateGroupAdmin: { mutateAsync: (params: { userId: string; isAdmin: boolean }) => Promise<void> };
    leaveGroup: { mutateAsync: () => Promise<void> };
    deleteChat: { mutateAsync: (params: { chatId: string }) => Promise<void> };
    blockChat: { mutateAsync: (params: { chatId: string }) => Promise<void> };
    clearChat: { mutateAsync: (params: { chatId: string }) => Promise<void> };
    createChat: { mutateAsync: (params: { creatorId: string; participantId: string; type: string; name: string; avatar: string }) => Promise<Chat> };
    sendFile: { mutateAsync: (params: { chatId: string; formData: FormData; file: File }) => Promise<void> };
    sendMessage: { mutateAsync: (params: { chatId: string; content: string; type: string }) => Promise<void> };
}

export type GroupSettingKey = 'onlyAdminsCanPost' | 'onlyAdminsCanAddMembers' | 'onlyAdminsCanChangeInfo';

export interface SettingConfig {
    key: GroupSettingKey;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
}


