import React, { useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { ToastProps } from '../../../../../domain/types/dashboard/faculty';

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
    const typeColors: Record<string, string> = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-orange-50 border-orange-200 text-orange-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg border shadow-lg z-50 ${typeColors[type]}`}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{message}</p>
                <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
                    <HiX className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
