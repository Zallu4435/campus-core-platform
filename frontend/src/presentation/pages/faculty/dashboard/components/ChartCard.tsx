import React from 'react';
import { ChartCardProps } from '../../../../../domain/types/dashboard/faculty';

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            {children}
        </div>
    );
};

export default ChartCard;
