import React, { useState, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiX, FiSearch } from 'react-icons/fi';
import { usePreferences } from '../../../../../application/context/PreferencesContext';
import { MaterialFiltersProps } from '../../../../../domain/types/canvas/materials';


const MaterialFilters: React.FC<MaterialFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    selectedCourse,
    setSelectedCourse,
    selectedType,
    setSelectedType,
    selectedSemester,
    setSelectedSemester,
    selectedDifficulty,
    setSelectedDifficulty,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    materials
}) => {
    const { styles } = usePreferences();
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(debouncedSearchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [debouncedSearchTerm, setSearchTerm]);

    useEffect(() => {
        setDebouncedSearchTerm(searchTerm);
    }, [searchTerm]);

    const extractedMaterials = materials.map(item => item.props || item);

    const courses = [...new Set(extractedMaterials.map(m => m.course))];
    const types = [...new Set(extractedMaterials.map(m => m.type))];
    const semesters = [...new Set(extractedMaterials.map(m => m.semester))];
    const difficulties = [...new Set(extractedMaterials.map(m => m.difficulty))];

    const getSemesterName = (semester: number) => {
        const currentYear = new Date().getFullYear();
        const semesterNames = {
            1: `Fall ${currentYear}`,
            2: `Spring ${currentYear + 1}`,
            3: `Summer ${currentYear + 1}`,
            4: `Fall ${currentYear + 1}`,
            5: `Spring ${currentYear + 2}`,
            6: `Summer ${currentYear + 2}`,
            7: `Fall ${currentYear + 2}`,
            8: `Spring ${currentYear + 3}`
        };
        return semesterNames[semester as keyof typeof semesterNames] || `Semester ${semester}`;
    };

    return (
        <div className={`${styles.card.background} rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 mb-6 sm:mb-8 ${styles.card.border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 relative w-full">
                    <FiSearch className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 ${styles.icon.secondary}`} size={16} />
                    <input
                        type="text"
                        placeholder="Search materials, courses, instructors, or tags..."
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 ${styles.input.border} rounded-lg sm:rounded-xl ${styles.input.focus} ${styles.input.background} transition-all duration-200 text-sm sm:text-lg`}
                        value={debouncedSearchTerm}
                        onChange={(e) => setDebouncedSearchTerm(e.target.value)}
                        aria-label="Search materials"
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 ${styles.button.outline} rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-sm sm:text-base w-full sm:w-auto`}
                    aria-label="Toggle filters"
                >
                    <FiFilter size={16} className="mr-2" />
                    Filters
                    <FiChevronDown size={16} className={`ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {showFilters && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div>
                            <label className={`block text-xs sm:text-sm font-medium ${styles.textPrimary} mb-1 sm:mb-2`}>Course</label>
                            <select
                                className={`w-full ${styles.input.border} rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 ${styles.input.focus} ${styles.input.background} text-xs sm:text-sm`}
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                aria-label="Filter by course"
                            >
                                <option value="">All Courses</option>
                                {courses.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={`block text-xs sm:text-sm font-medium ${styles.textPrimary} mb-1 sm:mb-2`}>Type</label>
                            <select
                                className={`w-full ${styles.input.border} rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 ${styles.input.focus} ${styles.input.background} text-xs sm:text-sm`}
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                aria-label="Filter by type"
                            >
                                <option value="">All Types</option>
                                {types.map(type => (
                                    <option key={type} value={type}>{type.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={`block text-xs sm:text-sm font-medium ${styles.textPrimary} mb-1 sm:mb-2`}>Semester</label>
                            <select
                                className={`w-full ${styles.input.border} rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 ${styles.input.focus} ${styles.input.background} text-xs sm:text-sm`}
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                aria-label="Filter by semester"
                            >
                                <option value="">All Semesters</option>
                                {semesters.sort((a, b) => a - b).map(semester => (
                                    <option key={semester} value={semester}>{getSemesterName(semester)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={`block text-xs sm:text-sm font-medium ${styles.textPrimary} mb-1 sm:mb-2`}>Difficulty</label>
                            <select
                                className={`w-full ${styles.input.border} rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 ${styles.input.focus} ${styles.input.background} text-xs sm:text-sm`}
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                aria-label="Filter by difficulty"
                            >
                                <option value="">All Levels</option>
                                {difficulties.map(difficulty => (
                                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={`block text-xs sm:text-sm font-medium ${styles.textPrimary} mb-1 sm:mb-2`}>Sort By</label>
                            <select
                                className={`w-full ${styles.input.border} rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 ${styles.input.focus} ${styles.input.background} text-xs sm:text-sm`}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort materials"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="downloads">Most Downloaded</option>
                                <option value="views">Most Viewed</option>
                                <option value="title">Alphabetical</option>
                            </select>
                        </div>
                    </div>

                    {(selectedCourse || selectedType || selectedSemester || selectedDifficulty) && (
                        <div className="mt-3 flex flex-col sm:flex-row sm:justify-end gap-2">
                            <button
                                onClick={() => {
                                    setSelectedCourse('');
                                    setSelectedType('');
                                    setSelectedSemester('');
                                    setSelectedDifficulty('');
                                }}
                                className={`flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${styles.button.outline} rounded-md sm:rounded-lg transition-colors`}
                                aria-label="Clear all filters"
                            >
                                <FiX size={14} className="mr-1" />
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MaterialFilters; 