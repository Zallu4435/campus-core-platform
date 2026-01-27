import { Message, Styles } from "../../../../../domain/types/canvas/chat";
import { FiUsers, FiLock, FiMessageSquare } from 'react-icons/fi';

export const getStyles = (isDarkMode: boolean): Styles => ({
  background: () => isDarkMode ? 'bg-gray-900' : 'bg-white',
  backgroundSecondary: () => isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
  card: {
    background: () => isDarkMode ? 'bg-gray-800' : 'bg-white',
    hover: () => isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  },
  text: {
    primary: () => isDarkMode ? 'text-white' : 'text-gray-900',
    secondary: () => isDarkMode ? 'text-gray-400' : 'text-gray-600',
    muted: () => isDarkMode ? 'text-gray-500' : 'text-gray-400'
  },
  border: () => isDarkMode ? 'border-gray-700' : 'border-gray-200',
  borderSecondary: () => isDarkMode ? 'border-gray-600' : 'border-gray-300',
  input: {
    background: () => isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
    border: () => isDarkMode ? 'border-gray-600' : 'border-gray-300',
    focus: () => isDarkMode ? 'focus:border-blue-500' : 'focus:border-blue-400'
  },
  button: {
    primary: () => isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: () => isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  },
  message: {
    sent: () => isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
    received: () => isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
  },
  accent: () => isDarkMode ? 'from-blue-600 to-purple-600' : 'from-blue-400 to-purple-500'
});

export const formatMessageTime = (date: string | Date): string => {
  const messageDate = new Date(date);
  const now = new Date();

  // Reset hours to compare just the dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

  const diffInTime = today.getTime() - msgDate.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

  if (diffInDays === 0) {
    return 'Today';
  }

  if (diffInDays === 1) {
    return 'Yesterday';
  }

  if (diffInDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'long' });
  }

  if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }

  return messageDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatChatTime = (date: string | Date): string => {
  const messageDate = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

  const diffInTime = today.getTime() - msgDate.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

  if (diffInDays === 0) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (diffInDays === 1) {
    return 'Yesterday';
  }

  if (diffInDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'short' });
  }

  if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }

  return messageDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

export const shouldShowDateHeader = (currentMessage: Message, previousMessage?: Message): boolean => {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.createdAt || '');
  const previousDate = new Date(previousMessage.createdAt || '');

  return currentDate.toDateString() !== previousDate.toDateString();
};


export const formatMessageTimeOnly = (date: string | Date): string => {
  const messageDate = new Date(date);
  return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const settingsConfig = [
  {
    key: 'onlyAdminsCanPost',
    icon: FiMessageSquare,
    label: 'Only admins can send messages',
    description: 'Restrict messaging to administrators only'
  },
  {
    key: 'onlyAdminsCanAddMembers',
    icon: FiUsers,
    label: 'Only admins can add members',
    description: 'Control who can invite new members'
  },
  {
    key: 'onlyAdminsCanChangeInfo',
    icon: FiLock,
    label: 'Only admins can change info',
    description: 'Restrict group information editing'
  }
];