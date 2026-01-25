import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { useLeadership } from '../../../application/hooks/useSiteSections';
import { SiteSection } from '../../../application/services/siteSections.service';
import SiteSectionModal from '../../components/public/SiteSectionModal';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

export const LeadershipPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLeader, setSelectedLeader] = useState<SiteSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allLeaders, setAllLeaders] = useState<SiteSection[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page and list when filters change
  useEffect(() => {
    setPage(1);
    setAllLeaders([]);
  }, [debouncedSearchQuery, selectedCategory]);

  const { data: response, isLoading, error } = useLeadership({
    limit: 6,
    page: page,
    search: debouncedSearchQuery || undefined,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
  });

  const categories = ['all', ...(response?.categories || [])];


  useEffect(() => {
    if (response?.sections) {
      if (page === 1) {
        setAllLeaders(response.sections);
      } else {
        setAllLeaders(prev => {
          const newItems = response.sections.filter(
            newItem => !prev.some(existingItem => existingItem.id === newItem.id)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [response, page]);

  useEffect(() => {
    if (searchInputRef.current && searchQuery.length > 0) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [allLeaders, searchQuery]);

  const handleLeaderClick = (leader: SiteSection) => {
    setSelectedLeader(leader);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLeader(null);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleLoadMore = () => {
    if (response && page < response.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const errorMessage = error instanceof Error ? error.message : (error ? 'Failed to load leadership information. Please try again later.' : null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-cyan-100/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center justify-center w-10 h-10 bg-cyan-50 hover:bg-cyan-100 rounded-full transition-all duration-200 group"
              >
                <FaArrowLeft className="text-cyan-600 group-hover:text-cyan-700 transition-colors" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">University Leadership</h1>
                <p className="text-sm text-gray-600">Meet our distinguished leaders and administrators</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
              <span>Total:</span>
              <span className="font-semibold text-cyan-600">{response?.total || 0}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search leadership..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-12 py-2.5 text-sm border border-gray-200 rounded-lg bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200 placeholder-gray-400"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="flex items-center"
                  >
                    <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                )}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200 cursor-pointer pr-6 min-w-[80px]"
                  >
                    {categories.map((category: string) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All' : category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                    <FaFilter className="h-3 w-3 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {errorMessage ? (
          <ErrorMessage message={errorMessage} />
        ) : isLoading && page === 1 ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : allLeaders.length === 0 ? (
          <div className="text-center py-12">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No leadership found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allLeaders.map((leader) => (
                <div
                  key={leader.id}
                  onClick={() => handleLeaderClick(leader)}
                  className="group bg-white rounded-xl overflow-hidden border border-cyan-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={leader.image}
                      alt={leader.title}
                      className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-gradient-to-r from-cyan-600 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        {leader.category || 'Leadership'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-cyan-600 transition-colors">
                      {leader.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {leader.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Joined: {new Date(leader.createdAt).toLocaleDateString()}</span>
                      <span className="text-cyan-600 font-medium">View Profile →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {response && page < response.totalPages && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="inline-flex items-center px-8 py-3 bg-white border-2 border-cyan-600 text-cyan-600 font-bold rounded-full hover:bg-cyan-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mr-2 group-hover:border-white group-hover:border-t-transparent" />
                  ) : null}
                  Load More Leaders
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <SiteSectionModal
        item={selectedLeader}
        isOpen={isModalOpen}
        onClose={closeModal}
        type="leadership"
      />
    </div>
  );
}; 