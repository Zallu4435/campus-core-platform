import React from 'react';
import { HiChevronRight } from 'react-icons/hi';
import { ActionCardProps } from '../../../../../domain/types/dashboard/faculty';

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon: Icon, onClick, color = 'blue' }) => {
    const gradientClasses: Record<string, string> = {
        blue: 'bg-gradient-to-r from-purple-500 to-pink-500',
        green: 'bg-gradient-to-r from-green-400 to-emerald-500',
        orange: 'bg-gradient-to-r from-orange-400 to-yellow-500',
        red: 'bg-gradient-to-r from-red-500 to-pink-500',
    };

    return (
        <button
            onClick={onClick}
            className={`rounded-3xl p-6 w-full shadow-2xl border border-pink-100 text-white flex flex-col justify-between items-start transition-all duration-200 transform hover:scale-105 hover:brightness-110 focus:outline-none ${gradientClasses[color]}`}
            style={{ minHeight: '170px' }}
        >
            <div className="flex items-center justify-between w-full mb-3">
                <div className="bg-white/30 rounded-xl p-2 flex items-center justify-center">
                    <Icon className="w-8 h-8" />
                </div>
                <HiChevronRight className="w-5 h-5 opacity-70" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-white drop-shadow-lg">{title}</h3>
            <p className="text-sm opacity-90 text-white/90">{description}</p>
        </button>
    );
};

export default ActionCard;
