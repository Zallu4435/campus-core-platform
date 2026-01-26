import React from 'react';
import { HiTrendingUp } from 'react-icons/hi';
import { StatsCardProps } from '../../../../../domain/types/dashboard/faculty';

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon: Icon, color = 'blue' }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        red: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend !== undefined && (
                        <p className={`text-sm flex items-center mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <HiTrendingUp className="w-4 h-4 mr-1" />
                            {trend > 0 ? '+' : ''}{trend}%
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
