import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaUsers, FaArrowLeft, FaFilter } from 'react-icons/fa';
import JoinRequestForm from './JoinRequestForm';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import ReactDOM from 'react-dom';
import type { ClubType, ClubUpcomingEvent } from '../../../../domain/types/user/campus-life';
import { toast } from 'react-hot-toast';
import { useCampusLife } from '../../../../application/hooks/useCampusLife';
import { formatDate } from '../../../../shared/utils/dateUtils';

export default function ClubsSection({ searchTerm, typeFilter, statusFilter, onFilterChange }: {
  searchTerm: string;
  typeFilter: string;
  statusFilter: string;
  onFilterChange: (filters: { search: string; type: string; status: string }) => void;
}) {
  const { clubs, requestToJoinClubAsync, isJoiningClub, joinClubError, isLoadingClubs, clubsError } = useCampusLife({
    activeTab: 'Clubs',
    searchTerm,
    typeFilter,
    statusFilter
  });
  const [selectedClub, setSelectedClub] = useState<ClubType | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const { styles, theme } = usePreferences();
  const [, setIsSearching] = useState(false);

  const handleClubClick = (club: ClubType) => {
    setSelectedClub(club);
    if (window.innerWidth < 640) {
      setShowMobileDetails(true);
    }
  };

  useEffect(() => {
    if (clubs && clubs.length > 0 && selectedClub) {
      const updatedClub = clubs.find(c => c.id === selectedClub.id);
      if (updatedClub) {
        setSelectedClub(updatedClub);
      }
    }
  }, [clubs, selectedClub]);

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

  const handleJoinRequest = async (request: any) => {
    if (!selectedClub) return;
    try {
      await requestToJoinClubAsync({ clubId: selectedClub.id, request });

      toast.success('Successfully submitted join request for club!');

      setShowJoinForm(false);
    } catch (error) {
      let errorMsg = 'Failed to submit join request';
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

  useEffect(() => {
    setSearchInput(searchTerm);
    if (searchTerm === '') {
      setSearchInput('');
    }
  }, [searchTerm]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (searchInput !== searchTerm) {
      setIsSearching(true);
      debounceTimeout.current = setTimeout(() => {
        onFilterChange({ search: searchInput, type: typeFilter, status: statusFilter });
        setIsSearching(false);
      }, 400);
    } else {
      setIsSearching(false);
    }

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchInput, searchTerm, typeFilter, statusFilter, onFilterChange]);

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
                <FaUsers size={20} className="text-white relative z-10" />
              </div>
              <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
            <div>
              <h3 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
                Student Organizations
              </h3>
              <div className={`h-1 w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-24 transition-all duration-300`}></div>
            </div>
          </div>
          <span className={`bg-amber-200 text-orange-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}>
            Spring 2025
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 relative overflow-hidden rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl blur transition-all duration-300`}></div>
          <div className="relative z-10">
            <div className="p-4 pb-0">
              <div className="relative flex items-center gap-2 w-full">
                <FaSearch className={`absolute left-3 top-3 ${styles.icon.secondary}`} size={16} />
                <input
                  type="text"
                  placeholder="Search clubs..."
                  className={`w-full pl-10 pr-10 py-2 ${styles.input.background} border ${styles.input.border} rounded-full focus:${styles.input.focus} transition-all duration-300 text-sm`}
                  value={searchInput}
                  onChange={e => {
                    setSearchInput(e.target.value);
                  }}
                />
                <button
                  type="button"
                  aria-label="Filter clubs"
                  className="absolute right-2 top-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
                  onClick={() => setFilterOpen((v) => !v)}
                >
                  <FaFilter className="text-slate-500" size={16} />
                </button>
              </div>
              {filterOpen && (
                <div>
                  <div className="fixed inset-0 z-50 flex items-start justify-center sm:hidden" onClick={() => setFilterOpen(false)}>
                    <div className="bg-white w-full mx-2 mt-4 rounded-2xl shadow-xl border border-cyan-100 p-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-slate-700">Filter Clubs</span>
                        <button onClick={() => setFilterOpen(false)} className="p-2 rounded-full hover:bg-slate-100">
                          <FaArrowLeft className="text-slate-500" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-3">
                        <select
                          className="py-2 px-3 rounded-full border border-slate-200 bg-white text-sm"
                          value={typeFilter}
                          onChange={e => {
                            onFilterChange({ search: searchTerm, type: e.target.value, status: statusFilter });
                          }}
                        >
                          <option value="">All Types</option>
                          <option value="Tech">Tech</option>
                          <option value="Arts">Arts</option>
                          <option value="Cultural">Cultural</option>
                        </select>
                        <select
                          className="py-2 px-3 rounded-full border border-slate-200 bg-white text-sm"
                          value={statusFilter}
                          onChange={e => {
                            onFilterChange({ search: searchTerm, type: typeFilter, status: e.target.value });
                          }}
                        >
                          <option value="all">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <button
                          className="mt-2 py-2 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm border border-slate-200 transition"
                          onClick={() => {
                            onFilterChange({ search: '', type: '', status: 'all' });
                            setFilterOpen(false);
                          }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block fixed inset-0 z-40" onClick={() => setFilterOpen(false)}></div>
                  <div className="hidden sm:block absolute right-4 top-14 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-cyan-100 p-4 mt-2" style={{ minWidth: 220 }} onClick={e => e.stopPropagation()}>
                      <div className="font-semibold text-slate-700 mb-3">Filter Clubs</div>
                      <div className="flex flex-col gap-3">
                        <select
                          className="py-2 px-3 rounded-full border border-slate-200 bg-white text-sm"
                          value={typeFilter}
                          onChange={e => {
                            onFilterChange({ search: searchTerm, type: e.target.value, status: statusFilter });
                          }}
                        >
                          <option value="">All Types</option>
                          <option value="Tech">Tech</option>
                          <option value="Arts">Arts</option>
                          <option value="Cultural">Cultural</option>
                        </select>
                        <select
                          className="py-2 px-3 rounded-full border border-slate-200 bg-white text-sm"
                          value={statusFilter}
                          onChange={e => {
                            onFilterChange({ search: searchTerm, type: typeFilter, status: e.target.value });
                          }}
                        >
                          <option value="">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <button
                          className="mt-2 py-2 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm border border-slate-200 transition"
                          onClick={() => {
                            onFilterChange({ search: '', type: '', status: '' });
                            setFilterOpen(false);
                          }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-amber-100/50">
              {isLoadingClubs && searchInput.trim() && (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className={`text-sm ${styles.textSecondary}`}>Searching clubs...</span>
                  </div>
                </div>
              )}
              {clubsError && <div className="p-4 text-center text-sm text-red-500">Failed to load clubs</div>}
              {!isLoadingClubs && clubs.length === 0 && searchInput.trim() && (
                <div className={`p-4 text-center ${styles.textSecondary} text-sm`}>No clubs found matching "{searchInput}"</div>
              )}
              {!isLoadingClubs && clubs.length === 0 && !searchInput.trim() && !clubsError && (
                <div className={`p-4 text-center ${styles.textSecondary} text-sm`}>No clubs found</div>
              )}
              {!isLoadingClubs && clubs.map((club: ClubType) => (
                <div
                  key={club.id}
                  className={`p-4 cursor-pointer group/item hover:bg-amber-50/50 transition-all duration-300 border-l-4 ${selectedClub?.id === club.id ? 'bg-orange-50/70 border-orange-400' : 'border-transparent hover:border-amber-200'
                    }`}
                  onClick={() => handleClubClick(club)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm`}
                      style={{ backgroundColor: club.color }}
                    >
                      {club.icon}
                    </div>
                    <div className="flex-grow">
                      <h4 className={`font-semibold ${styles.textPrimary} text-sm sm:text-base truncate`}>{club.name}</h4>
                      <div className={`text-xs sm:text-sm ${styles.textSecondary} flex justify-between items-center`}>
                        <span>{club.role || 'Member'}</span>
                        <span className="opacity-60 text-[10px]">
                          {club.nextMeeting && club.nextMeeting !== 'TBA'
                            ? `Next: ${club.nextMeeting}`
                            : `Since ${formatDate(club.createdAt || '')}`}
                        </span>
                      </div>
                    </div>
                    {selectedClub?.id === club.id ? (
                      <div className={`w-2 h-2 rounded-full ${styles.status.warning}`}></div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {ReactDOM.createPortal(
          <div
            className={`fixed inset-0 z-[9999] ${styles.card.background} transition-transform duration-700 transform sm:hidden flex flex-col
                ${showMobileDetails && selectedClub ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}`}
            style={{ willChange: 'transform' }}
          >
            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                aria-label="Back"
                className={`mr-3 text-2xl focus:outline-none ${styles.textPrimary}`}
                onClick={() => setShowMobileDetails(false)}
              >
                <FaArrowLeft className={styles.accent} />
              </button>
              <span className="font-bold text-lg text-gray-800 dark:text-white">Club Details</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {selectedClub ? (
                  <>
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold mr-4`}
                        style={{ backgroundColor: selectedClub.color }}
                      >
                        {selectedClub.icon}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{selectedClub.name}</h3>
                        <div className="flex items-center space-x-2">
                          <p className={`text-xs ${styles.textSecondary}`}>{selectedClub.type} • {selectedClub.members} members</p>
                          {selectedClub.createdAt && (
                            <span className={`text-[10px] ${styles.textSecondary} opacity-60`}>• {formatDate(selectedClub.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedClub.status && (
                      <div className={`bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium mb-4`}>
                        {selectedClub.status}
                      </div>
                    )}
                    <h4 className={`text-base font-bold ${styles.status.warning} mb-2`}>About</h4>
                    <p className={`text-sm ${styles.textPrimary} mb-4`}>{selectedClub.about}</p>

                    <h4 className={`text-base font-bold ${styles.status.warning} mb-2`}>Leadership & Community</h4>
                    <div className={`relative overflow-hidden rounded-lg p-3 mb-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300`}>
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                      <div className="relative z-10">
                        <div className={`mb-2 text-sm ${styles.textPrimary}`}>
                          <span className="font-medium">Founded By:</span>
                          <span className="ml-2">{selectedClub.createdBy || 'University Administration'}</span>
                        </div>
                        <div className={`mb-2 text-sm ${styles.textPrimary}`}>
                          <span className="font-medium">Active Membership:</span>
                          <span className="ml-2">{selectedClub.members} students</span>
                        </div>
                        <div className={`text-sm ${styles.textPrimary}`}>
                          <span className="font-medium">Your Role:</span>
                          <span className="ml-2 font-semibold text-orange-600">{selectedClub.role || 'Prospective Member'}</span>
                        </div>
                      </div>
                    </div>

                    {selectedClub.upcomingEvents && selectedClub.upcomingEvents.length > 0 && (
                      <>
                        <h4 className={`text-base font-bold ${styles.status.warning} mb-2`}>Upcoming Event Schedule</h4>
                        <ul className={`relative overflow-hidden rounded-lg p-3 mb-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300`}>
                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                          <div className="relative z-10">
                            {selectedClub.upcomingEvents.map((event: string | ClubUpcomingEvent, index: number) => {
                              if (typeof event === 'string') {
                                return (
                                  <li key={index} className={`mb-3 flex text-sm ${styles.textPrimary}`}>
                                    <span className={`${styles.status.warning} mr-2`}>•</span>
                                    <span>{event}</span>
                                  </li>
                                );
                              } else if (event && typeof event === 'object') {
                                const hasDate = event.date && event.date.trim() !== '';
                                const hasDescription = event.description && event.description.trim() !== '';
                                return (
                                  <li key={index} className={`mb-3 flex text-sm ${styles.textPrimary}`}>
                                    <span className={`${styles.status.warning} mr-2`}>•</span>
                                    <span>
                                      {hasDate && hasDescription
                                        ? `${formatDate(event.date || '')}: ${event.description}`
                                        : hasDate
                                          ? formatDate(event.date || '')
                                          : hasDescription
                                            ? event.description
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
                    )}
                    {!showJoinForm ? (
                      <button
                        onClick={() => setShowJoinForm(true)}
                        disabled={selectedClub.userRequestStatus === 'pending' || selectedClub.userRequestStatus === 'approved'}
                        className={`group/btn mt-4 w-full bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white py-2 px-4 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center space-x-2 text-sm ${selectedClub.userRequestStatus === 'pending' || selectedClub.userRequestStatus === 'approved' ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                      >
                        <span>
                          {selectedClub.userRequestStatus === 'pending'
                            ? 'Request Pending'
                            : selectedClub.userRequestStatus === 'approved'
                              ? 'Already Joined'
                              : 'Request to Join'}
                        </span>
                        <FaUsers size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </button>
                    ) : (
                      <div className="mt-4">
                        <JoinRequestForm
                          onSubmit={handleJoinRequest}
                          onCancel={() => setShowJoinForm(false)}
                          isLoading={isJoiningClub}
                          title={selectedClub.name}
                        />
                        {joinClubError && (
                          <div className={`mt-2 ${styles.status.error} text-sm`}>
                            Failed to submit join request. Please try again.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-sm text-gray-400">Select a club to view details.</div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

        <div className="hidden sm:block lg:col-span-2 md:col-span-1">
          {!selectedClub ? (
            <div className={`relative overflow-hidden rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl blur transition-all duration-300`}></div>
              <div className="relative z-10 p-6 sm:p-8 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${styles.accent}`}>
                  <FaUsers className="text-white" size={24} />
                </div>
                <h3 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>Select a Club</h3>
                <p className={`text-sm sm:text-base ${styles.textSecondary}`}>Select a club from the list to view its details.</p>
              </div>
            </div>
          ) : (
            <div className={`relative overflow-hidden rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl blur transition-all duration-300`}></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6">
                  <div className="flex items-center flex-1 mb-4 sm:mb-0">
                    <div
                      className={`w-12 h-12 rounded-full text-white flex items-center justify-center font-bold mr-4`}
                      style={{ backgroundColor: selectedClub.color }}
                    >
                      {selectedClub.icon}
                    </div>
                    <div>
                      <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{selectedClub.name}</h3>
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm ${styles.textSecondary}`}>{selectedClub.type} • {selectedClub.members} members</p>
                        {selectedClub.createdAt && (
                          <span className={`text-[10px] ${styles.textSecondary} opacity-60`}>• {formatDate(selectedClub.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm md:text-base ${styles.textSecondary} sm:text-right px-4 sm:px-0`}>
                    <div className={`font-medium ${styles.textPrimary}`}>{selectedClub.nextMeeting ? 'Next Meeting' : ''}</div>
                    <div className={`${styles.status.warning}`}>{selectedClub.nextMeeting ? formatDate(selectedClub.nextMeeting) : 'TBA'}</div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h4 className={`text-base font-bold ${styles.status.warning} mb-2`}>About</h4>
                  <p className={`text-sm sm:text-base ${styles.textPrimary} mb-6`}>{selectedClub.about}</p>

                  <h4 className={`text-base font-bold ${styles.status.warning} mb-2`}>Leadership & Community</h4>
                  <div className={`relative overflow-hidden rounded-lg p-4 mb-6 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300`}>
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                    <div className="relative z-10">
                      <div className={`mb-2 text-sm sm:text-base ${styles.textPrimary}`}>
                        <span className="font-medium">Founded By:</span>
                        <span className="ml-2">{selectedClub.createdBy || 'University Administration'}</span>
                      </div>
                      <div className={`mb-2 text-sm sm:text-base ${styles.textPrimary}`}>
                        <span className="font-medium">Active Membership:</span>
                        <span className="ml-2">{selectedClub.members} active students</span>
                      </div>
                      <div className={`text-sm sm:text-base ${styles.textPrimary}`}>
                        <span className="font-medium">Your Role:</span>
                        <span className="ml-2 font-semibold text-orange-600">{selectedClub.role || 'Prospective Member'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedClub.upcomingEvents && (
                    <>
                      <h4 className={`text-base font-bold ${styles.status.warning} mb-2`}>Upcoming Events</h4>
                      <ul className={`relative overflow-hidden rounded-lg p-4 mb-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300`}>
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                        <div className="relative z-10">
                          {selectedClub.upcomingEvents.map((event: string | ClubUpcomingEvent, index: number) => {
                            if (typeof event === 'string') {
                              return (
                                <li key={index} className={`mb-3 flex text-sm ${styles.textPrimary}`}>
                                  <span className={`${styles.status.warning} mr-2`}>•</span>
                                  <span>{event}</span>
                                </li>
                              );
                            } else if (event && typeof event === 'object') {
                              const hasDate = event.date && event.date.trim() !== '';
                              const hasDescription = event.description && event.description.trim() !== '';
                              return (
                                <li key={index} className={`mb-3 flex text-sm ${styles.textPrimary}`}>
                                  <span className={`${styles.status.warning} mr-2`}>•</span>
                                  <span>
                                    {hasDate && hasDescription
                                      ? `${formatDate(event.date || '')}: ${event.description}`
                                      : hasDate
                                        ? formatDate(event.date || '')
                                        : hasDescription
                                          ? event.description
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
                  )}
                  {!showJoinForm ? (
                    <button
                      onClick={() => setShowJoinForm(true)}
                      disabled={selectedClub.userRequestStatus === 'pending' || selectedClub.userRequestStatus === 'approved'}
                      className={`group/btn mt-4 w-full bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white py-2 px-4 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center space-x-2 text-sm ${selectedClub.userRequestStatus === 'pending' || selectedClub.userRequestStatus === 'approved' ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                    >
                      <span>
                        {selectedClub.userRequestStatus === 'pending'
                          ? 'Request Pending'
                          : selectedClub.userRequestStatus === 'approved'
                            ? 'Already Joined'
                            : 'Request to Join'}
                      </span>
                      <FaUsers size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </button>
                  ) : (
                    <div className="mt-4">
                      <JoinRequestForm
                        onSubmit={handleJoinRequest}
                        onCancel={() => setShowJoinForm(false)}
                        isLoading={isJoiningClub}
                        title={selectedClub.name}
                      />
                      {joinClubError && (
                        <div className={`mt-2 ${styles.status.error} text-sm`}>
                          Failed to submit join request. Please try again.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
