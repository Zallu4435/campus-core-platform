import React from 'react';
import { FaFilter } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { SessionFiltersProps } from '../../../../../domain/types/canvas/session';

export const SessionFilters: React.FC<Omit<SessionFiltersProps, 'filters' | 'onFilterChange'> & {
  filters: { status: string; instructor: string };
  onFilterChange: (filters: { status: string; instructor: string }) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}> = ({
  filters,
  onFilterChange,
  onClearFilters,
  uniqueInstructors,
  styles,
  searchTerm,
  setSearchTerm
}) => {
    return (
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className={`h-5 w-5 ${styles.icon.secondary} opacity-50`} />
            </div>
            <input
              type="text"
              placeholder="Search by title, instructor, or tag..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`block w-full pl-12 pr-4 py-3.5 ${styles.card.background} border ${styles.border} ${styles.textPrimary} rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-500 sm:text-sm shadow-sm`}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <select
                value={filters.status}
                onChange={(e) => onFilterChange({ ...filters, status: e.target.value as any })}
                className={`w-full md:w-40 px-4 py-3.5 ${styles.card.background} border ${styles.border} ${styles.textPrimary} rounded-2xl focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 sm:text-sm shadow-sm cursor-pointer appearance-none`}
              >
                <option value="all">All Status</option>
                <option value="live">🔴 Live</option>
                <option value="upcoming">⏰ Upcoming</option>
                <option value="ended">✅ Completed</option>
              </select>
            </div>

            <div className="flex-1 md:flex-none">
              <select
                value={filters.instructor}
                onChange={(e) => onFilterChange({ ...filters, instructor: e.target.value })}
                className={`w-full md:w-48 px-4 py-3.5 ${styles.card.background} border ${styles.border} ${styles.textPrimary} rounded-2xl focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 sm:text-sm shadow-sm cursor-pointer appearance-none`}
              >
                <option value="all">All Instructors</option>
                {uniqueInstructors.map(instructor => (
                  <option key={instructor} value={instructor}>{instructor}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onClearFilters}
              className={`p-3.5 ${styles.card.background} border ${styles.border} ${styles.textSecondary} hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all duration-300 shadow-sm group`}
              title="Clear all filters"
            >
              <FaFilter className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500`} />
            </button>
          </div>
        </div>
      </div>
    );
  }; 