export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();

  // Clean dates for comparison (ignoring time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (targetDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };

  // Only show year if it's not the current year
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric';
  }

  return date.toLocaleDateString('en-US', options);
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'N/A';

  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y ago`;
  }
};

export const formatTime = (timestamp: string): string => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeString = (timeString: string): string => {
  if (!timeString) return 'N/A';
  if (timeString.includes('AM') || timeString.includes('PM')) return timeString;

  // Try to parse HH:mm
  const [hours, minutes] = timeString.split(':');
  if (hours && minutes) {
    const h = parseInt(hours);
    const m = parseInt(minutes);
    if (!isNaN(h) && !isNaN(m)) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }
  }
  return timeString;
};
