import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTrophy, FaUsers, FaArrowRight, FaFilter } from 'react-icons/fa';
import { useCampusLife } from '../../../../application/hooks/useCampusLife';
import JoinRequestForm from './JoinRequestForm';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import ReactDOM from 'react-dom';
import type { Sport } from '../../../../domain/types/user/campus-life';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../../../shared/utils/dateUtils';


export default function AthleticsSection({ statusFilter, searchTerm, onFilterChange }: { statusFilter: string; searchTerm: string; onFilterChange: (filters: { search: string; status: string }) => void }) {
  const { sports, requestToJoinSport, isJoiningSport, joinSportError } = useCampusLife({
    activeTab: 'Athletics',
    sportsSearchTerm: searchTerm,
    sportsStatusFilter: statusFilter
  });
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const { styles, theme } = usePreferences();
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setSearchInput(searchTerm);
    if (searchTerm === '') {
      setSearchInput('');
    }
  }, [searchTerm]);

  useEffect(() => {
    if (sports && sports.length > 0 && selectedSport) {
      const updatedSport = sports.find(s => s.id === selectedSport.id);
      if (updatedSport) {
        setSelectedSport(updatedSport);
      }
    }
  }, [sports, selectedSport]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (searchInput !== searchTerm) {
      setIsSearching(true);
      debounceTimeout.current = setTimeout(() => {
        onFilterChange({ search: searchInput, status: statusFilter });
        setIsSearching(false);
      }, 400);
    } else {
      setIsSearching(false);
    }

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchInput, searchTerm, statusFilter, onFilterChange]);

  const handleJoinRequest = async (request: any) => {
    if (!selectedSport) return;
    try {
      await requestToJoinSport({ sportId: selectedSport.id, request });

      toast.success('Successfully submitted tryout request for sports team!');

      setShowJoinForm(false);
    } catch (error) {
      let errorMsg = 'Failed to submit tryout request';
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { error?: string; data?: { error?: string } } } }).response;
        errorMsg =
          response?.data?.error ||
          response?.data?.data?.error ||
          (error as { message?: string }).message ||
          errorMsg;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }

      toast.error(errorMsg);
      console.error('Failed to submit join request:', error);
    }
  };

  const handleSportClick = (sport: Sport) => {
    setSelectedSport(sport);
    if (window.innerWidth < 640) {
      setShowMobileDetails(true);
    }
  };

  React.useEffect(() => {
    if (showMobileDetails) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showMobileDetails]);

  return (
    <div className="relative">
      <div className={`relative overflow-hidden rounded-t-2xl shadow-xl bg-gradient-to-r ${styles.accent} group mb-6`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${styles.orb.primary}`}></div>
        <div className={`absolute -top-8 -left-8 w-48 h-48 rounded-full bg-gradient-to-br ${styles.orb.primary} blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${styles.orb.secondary} blur-2xl animate-pulse delay-700`}></div>
        <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                <FaTrophy size={20} className="text-white relative z-10" />
              </div>
              <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
            <div>
              <h3 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
                University Athletics
              </h3>
              <div className={`h-1 w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-24 transition-all duration-300`}></div>
            </div>
          </div>
          <span className={`bg-amber-200 text-orange-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}>
            Spring 2025
          </span>
        </div>
      </div>

      {(sports?.length ?? 0) === 0 ? (
        <div className={`relative overflow-hidden rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl blur transition-all duration-300`}></div>
          <div className="relative z-10 p-8 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${styles.accent}`}>
              <FaTrophy className="text-white" size={24} />
            </div>
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>No Sports Available</h3>
            <p className={`text-sm sm:text-base ${styles.textSecondary}`}>
              There are no sports teams available at the moment. Check back later for updates.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-1 relative overflow-hidden rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl blur transition-all duration-300`}></div>
            <div className="relative z-10">
              <div className="p-4">
                <div className="relative flex items-center">
                  <FaSearch className={`absolute left-3 top-3 ${styles.icon.secondary}`} size={16} />
                  <input
                    type="text"
                    placeholder="Search sports..."
                    className={`w-full pl-10 pr-10 py-2 ${styles.input.background} border ${styles.input.border} rounded-full focus:${styles.input.focus} transition-all duration-300 text-sm`}
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label="Filter sports"
                    className="absolute right-2 top-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
                    onClick={() => setFilterOpen((v) => !v)}
                  >
                    <FaFilter className="text-slate-500" size={16} />
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 mt-2 z-20 bg-white border rounded-lg shadow-lg p-3 min-w-[160px]">
                      <label className="block text-xs font-semibold mb-1 text-gray-700">Status</label>
                      <select
                        className="w-full border rounded p-2 text-sm mb-2"
                        value={statusFilter}
                        onChange={e => {
                          onFilterChange({ search: searchTerm, status: e.target.value });
                          setFilterOpen(false);
                        }}
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="past">Past</option>
                      </select>
                      <button
                        className="w-full mt-1 py-1.5 px-3 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition"
                        onClick={() => {
                          onFilterChange({ search: '', status: 'all' });
                          setFilterOpen(false);
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-amber-100/50">
                {isSearching && searchInput.trim() && (
                  <div className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className={`text-sm ${styles.textSecondary}`}>Searching sports...</span>
                    </div>
                  </div>
                )}
                {!isSearching && sports?.map((sport: Sport) => (
                  <div
                    key={sport.id}
                    className={`p-4 cursor-pointer group/item hover:bg-amber-50/50 transition-all duration-300 border-l-4 ${selectedSport?.id === sport.id ? 'bg-orange-50/70 border-orange-400' : 'border-transparent hover:border-amber-200'
                      }`}
                    onClick={() => handleSportClick(sport)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm`}
                        style={{ backgroundColor: sport.color }}
                      >
                        {sport.icon}
                      </div>
                      <div className="flex-grow">
                        <h4 className={`font-semibold ${styles.textPrimary} text-sm sm:text-base truncate`}>{sport.title}</h4>
                        <div className={`text-xs sm:text-sm ${styles.textSecondary} flex justify-between items-center`}>
                          <span>{sport.participants} players</span>
                          <span className="opacity-60 text-[10px]">
                            {sport.upcomingGames && sport.upcomingGames.length > 0
                              ? `Next: ${typeof sport.upcomingGames[0] === 'string' ? sport.upcomingGames[0].split(':')[0] : (sport.upcomingGames[0] as any).date ? formatDate((sport.upcomingGames[0] as any).date) : formatDate(sport.createdAt || '')}`
                              : `Since ${formatDate(sport.createdAt || '')}`}
                          </span>
                        </div>
                      </div>
                      {selectedSport?.id === sport.id && (
                        <div className={`w-2 h-2 rounded-full ${styles.status.warning}`}></div>
                      )}
                    </div>
                  </div>
                ))}
                {!isSearching && (sports?.length ?? 0) === 0 && searchInput.trim() && (
                  <div className={`p-4 text-center ${styles.textSecondary} text-sm`}>No sports found matching "{searchInput}"</div>
                )}
                {!isSearching && (sports?.length ?? 0) === 0 && !searchInput.trim() && (
                  <div className={`p-4 text-center ${styles.textSecondary} text-sm`}>No sports found</div>
                )}
              </div>
            </div>
          </div>

          <div className={`hidden sm:block lg:col-span-2 relative overflow-hidden rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl blur transition-all duration-300`}></div>
            <div className="relative z-10">
              {!selectedSport ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${styles.accent}`}>
                    <FaTrophy className="text-white" size={24} />
                  </div>
                  <h3 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>Select a Sport</h3>
                  <p className={`text-sm sm:text-base ${styles.textSecondary}`}>
                    Choose a sport from the list to view its details and try out for the team.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6">
                    <div className="flex items-center flex-1 mb-4 sm:mb-0">
                      <div
                        className={`w-12 h-12 rounded-full text-white flex items-center justify-center font-bold mr-4`}
                        style={{ backgroundColor: selectedSport.color }}
                      >
                        {selectedSport.icon}
                      </div>
                      <div>
                        <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{selectedSport.title}</h3>
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm ${styles.textSecondary}`}>{selectedSport.division}</p>
                          {selectedSport.createdAt && (
                            <span className={`text-[10px] ${styles.textSecondary} opacity-60`}>• {formatDate(selectedSport.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs sm:text-sm md:text-base ${styles.textSecondary} sm:text-right px-4 sm:px-0`}>
                      <div className={`font-medium ${styles.textPrimary}`}>Head Coach</div>
                      <div className={`${styles.status.warning}`}>{selectedSport.headCoach}</div>
                    </div>
                  </div>
                  {selectedSport.type === 'Basketball' && (
                    <div className="px-4 sm:px-6 mb-4">
                      <div className={`inline-flex bg-amber-300 text-amber-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium items-center space-x-1`}>
                        <FaTrophy size={12} />
                        <span>Championship Season!</span>
                      </div>
                    </div>
                  )}
                  <div className="p-4 sm:p-6">
                    <h4 className={`text-base sm:text-lg font-bold ${styles.status.warning} mb-4`}>Team Information</h4>
                    <div className={`relative overflow-hidden rounded-lg p-4 mb-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300`}>
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                      <div className="relative z-10">
                        <div className={`mb-2 text-sm sm:text-base ${styles.textPrimary}`}>
                          <span className="font-medium">Head Coach:</span>
                          <span className="ml-2">{selectedSport.headCoach}</span>
                        </div>
                        <div className={`mb-2 text-sm sm:text-base ${styles.textPrimary}`}>
                          <span className="font-medium">Home Games:</span>
                          <span className="ml-2">{selectedSport.homeGames}</span>
                        </div>
                        <div className={`mb-2 text-sm sm:text-base ${styles.textPrimary}`}>
                          <span className="font-medium">Current Record:</span>
                          <span className="ml-2">{selectedSport.record}</span>
                        </div>
                      </div>
                    </div>
                    {(selectedSport?.upcomingGames?.length ?? 0) > 0 ? (
                      <>
                        <h4 className={`text-base sm:text-lg font-bold ${styles.status.warning} mb-2`}>Upcoming Games</h4>
                        <ul className={`relative overflow-hidden rounded-lg p-4 mb-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300`}>
                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                          <div className="relative z-10">
                            {selectedSport?.upcomingGames?.map((game, index) => {
                              if (typeof game === 'string') {
                                return (
                                  <li key={index} className={`mb-2 flex text-sm sm:text-base ${styles.textPrimary}`}>
                                    <span className={`${styles.status.warning} mr-2`}>•</span>
                                    <span>{game}</span>
                                  </li>
                                );
                              } else if (game && typeof game === 'object' && ('date' in game || 'description' in game)) {
                                const hasDate = !!game.date;
                                const hasDescription = !!game.description;
                                return (
                                  <li key={index} className={`mb-2 flex text-sm sm:text-base ${styles.textPrimary}`}>
                                    <span className={`${styles.status.warning} mr-2`}>•</span>
                                    <span>
                                      {hasDate && hasDescription
                                        ? `${formatDate(game.date || '')}: ${game.description}`
                                        : hasDate
                                          ? formatDate(game.date || '')
                                          : hasDescription
                                            ? game.description
                                            : ''}
                                    </span>
                                  </li>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </ul>
                      </>
                    ) : (
                      <p className={`text-sm sm:text-base ${styles.textSecondary}`}>No upcoming games scheduled.</p>
                    )}
                    {!showJoinForm ? (
                      <button
                        onClick={() => setShowJoinForm(true)}
                        disabled={selectedSport.userRequestStatus === 'pending' || selectedSport.userRequestStatus === 'approved'}
                        className={`group/btn mt-4 w-full bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white py-2 sm:py-3 px-4 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center space-x-2 text-sm sm:text-base ${selectedSport.userRequestStatus === 'pending' || selectedSport.userRequestStatus === 'approved' ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                      >
                        <span>
                          {selectedSport.userRequestStatus === 'pending'
                            ? 'Request Pending'
                            : selectedSport.userRequestStatus === 'approved'
                              ? 'Already Joined'
                              : 'Try Out for Team'}
                        </span>
                        <FaTrophy size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </button>
                    ) : (
                      <div className="mt-4">
                        <JoinRequestForm
                          onSubmit={handleJoinRequest}
                          onCancel={() => setShowJoinForm(false)}
                          isLoading={isJoiningSport}
                          title={selectedSport.title}
                        />
                        {joinSportError && (
                          <div className={`mt-2 ${styles.status.error} text-sm`}>
                            Failed to submit tryout request. Please try again.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
      }

      {
        ReactDOM.createPortal(
          <div
            className={`fixed inset-0 z-[9999] ${styles.card.background} transition-transform duration-700 transform sm:hidden flex flex-col
            ${showMobileDetails && selectedSport ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
            style={{ willChange: 'transform' }}
          >
            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 justify-between">
              <span className="font-bold text-lg text-gray-800 dark:text-white">Sport Details</span>
              <button
                aria-label="Close"
                className={`ml-3 text-2xl focus:outline-none ${styles.textPrimary}`}
                onClick={() => setShowMobileDetails(false)}
              >
                <FaArrowRight className={styles.accent} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {selectedSport ? (
                  <>
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold mr-4`}
                        style={{ backgroundColor: selectedSport.color }}
                      >
                        {selectedSport.icon}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{selectedSport.title}</h3>
                        <div className="flex items-center space-x-2">
                          <p className={`text-xs ${styles.textSecondary}`}>{selectedSport.division}</p>
                          {selectedSport.createdAt && (
                            <span className={`text-[10px] ${styles.textSecondary} opacity-60`}>• {formatDate(selectedSport.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <h4 className={`text-base font-bold ${styles.status.warning} mb-4`}>Team Information</h4>
                    <div className={`relative overflow-hidden rounded-lg p-3 mb-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300`}>
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                      <div className="relative z-10">
                        <div className={`mb-2 text-sm ${styles.textPrimary}`}>
                          <span className="font-medium">Head Coach:</span>
                          <span className="ml-2">{selectedSport.headCoach}</span>
                        </div>
                        <div className={`mb-2 text-sm ${styles.textPrimary}`}>
                          <span className="font-medium">Home Games:</span>
                          <span className="ml-2">{selectedSport.homeGames}</span>
                        </div>
                        <div className={`text-sm ${styles.textPrimary}`}>
                          <span className="font-medium">Current Record:</span>
                          <span className="ml-2">{selectedSport.record}</span>
                        </div>
                      </div>
                    </div>
                    {(selectedSport?.upcomingGames?.length ?? 0) > 0 ? (
                      <>
                        <h4 className={`text-base font-bold ${styles.status.warning} mb-2`}>Upcoming Games</h4>
                        <ul className={`relative overflow-hidden rounded-lg p-4 mb-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300`}>
                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                          <div className="relative z-10">
                            {selectedSport?.upcomingGames?.map((game, index) => {
                              if (typeof game === 'string') {
                                return (
                                  <li key={index} className={`mb-2 flex text-sm sm:text-base ${styles.textPrimary}`}>
                                    <span className={`${styles.status.warning} mr-2`}>•</span>
                                    <span>{game}</span>
                                  </li>
                                );
                              } else if (game && typeof game === 'object' && ('date' in game || 'description' in game)) {
                                const hasDate = !!game.date;
                                const hasDescription = !!game.description;
                                return (
                                  <li key={index} className={`mb-2 flex text-sm sm:text-base ${styles.textPrimary}`}>
                                    <span className={`${styles.status.warning} mr-2`}>•</span>
                                    <span>
                                      {hasDate && hasDescription
                                        ? `${formatDate(game.date || '')}: ${game.description}`
                                        : hasDate
                                          ? formatDate(game.date || '')
                                          : hasDescription
                                            ? game.description
                                            : ''}
                                    </span>
                                  </li>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </ul>
                      </>
                    ) : (
                      <p className={`text-sm ${styles.textSecondary}`}>No upcoming games scheduled.</p>
                    )}
                    {!showJoinForm ? (
                      <button
                        onClick={() => setShowJoinForm(true)}
                        disabled={selectedSport.userRequestStatus === 'pending' || selectedSport.userRequestStatus === 'approved'}
                        className={`group/btn mt-4 w-full bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white py-2 sm:py-3 px-4 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center space-x-2 text-sm sm:text-base ${selectedSport.userRequestStatus === 'pending' || selectedSport.userRequestStatus === 'approved' ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                      >
                        <span>
                          {selectedSport.userRequestStatus === 'pending'
                            ? 'Request Pending'
                            : selectedSport.userRequestStatus === 'approved'
                              ? 'Already Joined'
                              : 'Try Out for Team'}
                        </span>
                        <FaTrophy size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </button>
                    ) : (
                      <div className="mt-4">
                        <JoinRequestForm
                          onSubmit={handleJoinRequest}
                          onCancel={() => setShowJoinForm(false)}
                          isLoading={isJoiningSport}
                          title={selectedSport.title}
                        />
                        {joinSportError && (
                          <div className={`mt-2 ${styles.status.error} text-sm`}>
                            Failed to submit tryout request. Please try again.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-sm text-gray-400">Select a sport to view details.</div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div >
  );
}