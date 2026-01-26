export const formatErrorMessage = (message: string): string => {
    if (!message) return 'An unexpected error occurred';

    // Specific check for phone pattern error
    if (message.includes('fails to match the required pattern') && message.toLowerCase().includes('phone')) {
        return 'Invalid phone number format. Please enter a valid phone number (e.g., +1234567890). It must not start with zero.';
    }

    // Generic pattern error cleanup
    if (message.includes('fails to match the required pattern')) {
        const fieldMatch = message.match(/^(\w+)/);
        const fieldName = fieldMatch ? fieldMatch[1] : 'Field';
        return `Invalid ${fieldName} format. Please check the requirements.`;
    }

    // Email validation
    if (message.includes('email') && (message.includes('invalid') || message.includes('pattern'))) {
        return 'Please enter a valid email address.';
    }

    // Password common errors
    if (message.toLowerCase().includes('password') && message.toLowerCase().includes('pattern')) {
        return 'Password must meet the required security criteria.';
    }

    return message;
};
