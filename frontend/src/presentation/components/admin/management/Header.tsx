import React, { useState } from 'react';
import { FiSearch, FiFilter, FiChevronUp, FiChevronDown, FiX } from 'react-icons/fi';
import FilterPanel from './FilterPanel';
import { HeaderProps } from '../../../../domain/types/management';

const Header: React.FC<HeaderProps> = ({
  title = "Management Dashboard",
  subtitle = "Manage your resources efficiently",
  stats = [],
  tabs = [],
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Search...",
  filters = {},
  filterOptions = {},
  debouncedFilterChange,
  customDateRange,
  handleCustomDateChange,
  handleResetFilters,
  onTabClick,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);

  const handleTabClick = (index: number) => {
    if (onTabClick) {
      onTabClick(index);
    }
  };

  return (
    <div className="mb-6 relative">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-xl shadow-2xl mb-6 border border-purple-800/30 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-10 z-0"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
            }}
          />
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-purple-500/20 blur-sm"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `floatParticle ${Math.random() * 10 + 15}s ease-in-out infinite ${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="container px-6 py-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white text-shadow-lg truncate">{title}</h1>
              <p className="text-purple-300 mt-2 text-shadow-sm leading-relaxed max-w-2xl">{subtitle}</p>
            </div>
            <div className={`grid gap-4 shrink-0 ${stats.length === 1 ? 'grid-cols-1' :
                stats.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                  'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
              }`}>
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  isPositive={stat.isPositive}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between pt-6 border-t border-purple-500/10">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {tabs.map((tab, index) => (
                <TabButton
                  key={index}
                  label={tab.label}
                  active={tab.active}
                  icon={tab.icon}
                  onClick={() => handleTabClick(index)}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300"
                  size={18}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-800/60 backdrop-blur-sm border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-purple-300 shadow-lg transition-all duration-300"
                  aria-label="Search"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/60 backdrop-blur-sm text-white hover:bg-gray-700/70 rounded-lg transition-all duration-300 w-full sm:w-auto justify-center border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50"
                aria-label={filterOpen ? 'Close filters' : 'Open filters'}
              >
                <FiFilter size={18} className="text-purple-400" />
                <span className="font-medium">Filters</span>
                {filterOpen ? (
                  <FiChevronUp size={16} className="text-purple-400" />
                ) : (
                  <FiChevronDown size={16} className="text-purple-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <FilterPanel
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        filters={filters}
        filterOptions={filterOptions}
        debouncedFilterChange={debouncedFilterChange}
        customDateRange={customDateRange}
        handleCustomDateChange={handleCustomDateChange}
        handleResetFilters={handleResetFilters}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          .text-shadow-lg {
            text-shadow: 0 0 15px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.3);
          }

          .text-shadow-sm {
            text-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
          }

          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          @keyframes floatParticle {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            25% {
              opacity: 0.8;
            }
            50% {
              transform: translateY(-20px) translateX(10px);
              opacity: 0.3;
            }
            75% {
              opacity: 0.7;
            }
            100% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
          }
        `
      }} />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, isPositive }) => (
  <div
    className="bg-gray-800/40 backdrop-blur-md p-4 rounded-xl border border-purple-500/20 flex items-center space-x-4 min-w-[180px] shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:bg-gray-800/60 group"
    role="region"
    aria-label={`${title} stat`}
  >
    <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-300 group-hover:bg-purple-600/30 transition-all duration-300 border border-purple-500/20 shadow-inner">
      <div className="transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-purple-400 mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <div className="flex items-center mt-1.5">
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {change}
        </span>
      </div>
    </div>
  </div>
);

interface TabButtonProps {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, icon, onClick }) => (
  <button
    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${active
      ? 'bg-purple-600/30 text-white font-medium shadow-lg border border-purple-500/50 backdrop-blur-sm'
      : 'text-purple-300 hover:bg-gray-800/60 hover:border-purple-500/30 hover:border backdrop-blur-sm'
      }`}
    onClick={onClick}
    role="tab"
    aria-selected={active}
    aria-label={`${label} tab`}
  >
    <span className={`${active ? 'text-purple-200' : 'text-purple-400'}`}>{icon}</span>
    <span>{label}</span>
  </button>
);

export default Header;