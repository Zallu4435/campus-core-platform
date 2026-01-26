import React, { useState } from 'react';
import { HiChevronRight } from 'react-icons/hi';
import { InfoCardProps } from '../../../../../domain/types/dashboard/faculty';

const InfoCard: React.FC<InfoCardProps> = ({ title, children, expandable = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {expandable && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <HiChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                )}
            </div>
            <div className={`transition-all duration-200 ${expandable && !isExpanded ? 'max-h-20 overflow-hidden' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default InfoCard;
