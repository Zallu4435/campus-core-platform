import { useState, useEffect } from 'react';
import CampusLifeTabs from './CampusLifeTabs';
import EventsSection from './EventsSection';
import ClubsSection from './ClubsSection';
import AthleticsSection from './AthleticsSection';
import { useCampusLife } from '../../../../application/hooks/useCampusLife';
import { FaUsers } from 'react-icons/fa';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

export default function CampusLife() {
  const [activeTab, setActiveTab] = useState('Events');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [athleticsStatusFilter, setAthleticsStatusFilter] = useState('all');
  const [athleticsSearchTerm, setAthleticsSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('all');
    setEventSearchTerm('');
    setAthleticsStatusFilter('all');
    setAthleticsSearchTerm('');
  }, [activeTab]);

  const { styles, theme } = usePreferences();
  const {
    events,
    sports,
    eventsError,
    sportsError,
    clubs,
    clubsError,
  } = useCampusLife({
    activeTab,
    searchTerm,
    typeFilter,
    statusFilter,
    eventSearchTerm,
    sportsSearchTerm: athleticsSearchTerm,
    sportsStatusFilter: athleticsStatusFilter
  });

  const error =
    (activeTab === 'Events' && eventsError) ||
    (activeTab === 'Clubs' && clubsError) ||
    (activeTab === 'Athletics' && sportsError);

  if (error) {
    return <ErrorMessage message={`Error loading ${activeTab.toLowerCase()} data. Please try again later.`} />;
  }

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${styles.background}`}>
      <div className="relative z-10 w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className={`group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} hover:${styles.card.hover} transition-all duration-300`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-xl sm:rounded-2xl blur transition-all duration-300`}></div>
          <div className="relative z-10 p-3 sm:p-5 md:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                  <FaUsers size={16} className="sm:w-5 sm:h-5 text-white relative z-10" />
                </div>
                <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
                  Campus Life
                </h2>
                <div className={`h-0.5 sm:h-1 w-12 sm:w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-16 sm:group-hover:w-24 transition-all duration-300`}></div>
              </div>
            </div>
            <p className={`mt-2 text-xs sm:text-sm ${styles.textSecondary} max-w-2xl`}>
              {activeTab === 'Events' && `Discover ${(events || []).length} upcoming campus events, workshops and seminars.`}
              {activeTab === 'Clubs' && `Explore ${(clubs || []).length} student organizations and interest groups.`}
              {activeTab === 'Athletics' && `Join ${(sports || []).length} university sports teams and athletic programs.`}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <CampusLifeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="mt-6">
          {activeTab === 'Events' && (
            <EventsSection
              searchTerm={eventSearchTerm}
              statusFilter={statusFilter}
              onFilterChange={({ search, status }) => {
                setEventSearchTerm(search);
                setStatusFilter(status);
              }}
            />
          )}
          {activeTab === 'Clubs' && (
            <ClubsSection
              searchTerm={searchTerm}
              typeFilter={typeFilter}
              statusFilter={statusFilter}
              onFilterChange={({ search, type, status }) => {
                setSearchTerm(search);
                setTypeFilter(type);
                setStatusFilter(status);
              }}
            />
          )}
          {activeTab === 'Athletics' && (
            <AthleticsSection
              statusFilter={athleticsStatusFilter}
              searchTerm={athleticsSearchTerm}
              onFilterChange={({ search, status }) => {
                setAthleticsSearchTerm(search);
                setAthleticsStatusFilter(status);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}