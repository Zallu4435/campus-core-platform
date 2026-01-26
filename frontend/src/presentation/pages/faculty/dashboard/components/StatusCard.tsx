import React from 'react';
import { HiCheckCircle, HiExclamationCircle, HiClock } from 'react-icons/hi';
import { StatusCardProps } from '../../../../../domain/types/dashboard/faculty';

const StatusCard: React.FC<StatusCardProps> = ({ title, status, message, timestamp }) => {
    const statusColors: Record<string, string> = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-orange-100 text-orange-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800'
    };

    const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
        success: HiCheckCircle,
        warning: HiExclamationCircle,
        error: HiExclamationCircle,
        info: HiClock
    };

    const StatusIcon = statusIcons[status];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${statusColors[status]}`}>
                    <StatusIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                    <p className="text-sm text-gray-500 mt-1">{message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
                </div>
            </div>
        </div>
    );
};

export default StatusCard;
