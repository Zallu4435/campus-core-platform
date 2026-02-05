import React, { useState, useMemo } from 'react';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiBook } from 'react-icons/fi';
import { useAdminDiplomaManagement } from '../../../../application/hooks/useAdminDiplomaManagement';
import WarningModal from '../../../components/common/WarningModal';
import Header from '../../../components/admin/management/Header';
import Pagination from '../../../components/admin/management/Pagination';
import ApplicationsTable from '../../../components/admin/management/ApplicationsTable';
import DiplomaForm from './DiplomaForm';
import DiplomaDetails from './DiplomaDetails';
import { debounce } from 'lodash';
import { Diploma } from '../../../../domain/types/management/diplomamanagement';
import { CATEGORIES, diplomaColumns } from '../../../../shared/constants/diplomaManagementConstants';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';
import EmptyState from '../../../../shared/components/EmptyState';

const DiplomaManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debouncedSetSearch = useMemo(() => debounce((val: string) => setDebouncedSearch(val), 400), []);
    const DATE_RANGES = [
        'All',
        'last_week',
        'last_month',
        'last_3_months',
        'custom',
    ];
    const [filters, setFilters] = useState({
        category: 'All Categories',
        status: 'All',
        dateRange: 'All',
        startDate: '',
        endDate: '',
    });
    const {
        diplomas,
        totalPages,
        page,
        setPage,
        isLoading,
        error,
        createDiploma,
        updateDiploma,
        deleteDiploma,
        diplomaDetails,
        isLoadingDiplomaDetails,
        handleViewDiploma,
        handleEditDiploma,
    } = useAdminDiplomaManagement(debouncedSearch, filters);

    const [showDiplomaModal, setShowDiplomaModal] = useState(false);
    const [showDiplomaDetail, setShowDiplomaDetail] = useState(false);
    const [editingDiploma, setEditingDiploma] = useState<Diploma | null>(null);
    const [diplomaToDelete, setDiplomaToDelete] = useState<Diploma | null>(null);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);

    const debouncedFilterChange = debounce((field: string, value: string) => {
        setFilters((prev) => {
            if (field === 'dateRange' && value !== 'custom') {
                return { ...prev, dateRange: value, startDate: '', endDate: '' };
            }
            return { ...prev, [field]: value };
        });
        setPage(1);
    }, 300);

    const handleResetFilters = () => {
        setFilters({
            category: 'All Categories',
            status: 'All',
            dateRange: 'All',
            startDate: '',
            endDate: '',
        });
        setPage(1);
        setSearchTerm('');
    };

    const handleAddDiploma = () => {
        setEditingDiploma(null);
        setShowDiplomaModal(true);
    };

    const handleSaveDiploma = async (data: unknown) => {
        const formData = data as Partial<Diploma>;
        try {
            if (editingDiploma) {
                await updateDiploma({ id: editingDiploma.id, data: formData });
            } else {
                await createDiploma({
                    ...formData,
                    videoIds: [],
                } as Omit<Diploma, '_id' | 'createdAt' | 'updatedAt'>);
            }
            setShowDiplomaModal(false);
            setEditingDiploma(null);
        } catch (error) {
            console.error('Error saving diploma:', error);
        }
    };

    const handleConfirmDelete = async () => {
        if (diplomaToDelete) {
            await deleteDiploma(diplomaToDelete.id);
            setShowDeleteWarning(false);
            setDiplomaToDelete(null);
        }
    };

    const diplomaActions = [
        {
            icon: <FiEye size={16} />,
            label: 'View Diploma',
            onClick: (diploma: Diploma) => {
                handleViewDiploma(diploma.id);
                setShowDiplomaDetail(true);
            },
            color: 'blue' as const,
        },
        {
            icon: <FiEdit size={16} />,
            label: 'Edit Diploma',
            onClick: (diploma: Diploma) => {
                handleEditDiploma(diploma.id);
                setEditingDiploma(diploma);
                setShowDiplomaModal(true);
            },
            color: 'green' as const,
        },
        {
            icon: <FiTrash2 size={16} />,
            label: 'Delete Diploma',
            onClick: (diploma: Diploma) => {
                setDiplomaToDelete(diploma);
                setShowDeleteWarning(true);
            },
            color: 'red' as const,
        },
    ];

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    const filteredDiplomas = diplomas;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
                <div className="absolute top-3/4 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-purple-500/10 blur-md"
                        style={{
                            width: `${Math.random() * 12 + 4}px`,
                            height: `${Math.random() * 12 + 4}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `floatingMist ${Math.random() * 15 + 20}s ease-in-out infinite ${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <Header
                    title="Diploma Course Management"
                    subtitle="Manage diploma courses"
                    stats={[
                        {
                            icon: <FiBook />,
                            title: 'Total Diplomas',
                            value: filteredDiplomas.length.toString(),
                            change: '+3.5%',
                            isPositive: true,
                        },
                    ]}
                    tabs={[
                        { label: 'Diplomas', icon: <FiBook size={16} />, active: true },
                    ]}
                    searchQuery={searchTerm}
                    setSearchQuery={(val) => {
                        setSearchTerm(val);
                        debouncedSetSearch(val);
                    }}
                    searchPlaceholder="Search diplomas..."
                    filters={filters}
                    filterOptions={{
                        category: CATEGORIES,
                        status: ['All', 'Active', 'Inactive'],
                        dateRange: DATE_RANGES,
                    }}
                    debouncedFilterChange={debouncedFilterChange}
                    handleResetFilters={handleResetFilters}
                    onTabClick={() => { }}
                />

                {filters.dateRange === 'custom' && (
                    <div className="flex gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Start Date</label>
                            <input
                                type="date"
                                className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                                value={filters.startDate}
                                onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">End Date</label>
                            <input
                                type="date"
                                className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                                value={filters.endDate}
                                onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-purple-500/20">
                        <div className="px-6 py-5">
                            <button
                                onClick={handleAddDiploma}
                                className="mb-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <FiPlus size={16} />
                                Add Diploma
                            </button>
                            {isLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : filteredDiplomas.length > 0 ? (
                                <>
                                    <ApplicationsTable
                                        data={filteredDiplomas}
                                        columns={diplomaColumns}
                                        actions={diplomaActions}
                                    />
                                    <Pagination
                                        page={page}
                                        totalPages={totalPages}
                                        itemsCount={filteredDiplomas.length}
                                        itemName="diplomas"
                                        onPageChange={(newPage) => setPage(newPage)}
                                        onFirstPage={() => setPage(1)}
                                        onLastPage={() => setPage(totalPages)}
                                    />
                                </>
                            ) : (
                                <EmptyState
                                    icon={<FiBook size={32} className="text-purple-400" />}
                                    title="No Diplomas Found"
                                    message="There are no diploma courses matching your current filters."
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showDiplomaModal && (
                <DiplomaForm
                    isOpen={showDiplomaModal}
                    onClose={() => setShowDiplomaModal(false)}
                    onSubmit={handleSaveDiploma}
                    initialData={editingDiploma}
                    isEditing={!!editingDiploma}
                    categories={CATEGORIES.filter((c) => c !== 'All Categories')}
                />
            )}

            {showDiplomaDetail && diplomaDetails && (
                <DiplomaDetails
                    isOpen={showDiplomaDetail}
                    onClose={() => setShowDiplomaDetail(false)}
                    diploma={diplomaDetails}
                    isLoading={isLoadingDiplomaDetails}
                />
            )}

            <WarningModal
                isOpen={showDeleteWarning}
                onClose={() => setShowDeleteWarning(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Diploma"
                message={diplomaToDelete ? `Are you sure you want to delete "${diplomaToDelete.title}"? This will also delete associated videos.` : ''}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            <style>{`
        @keyframes floatingMist {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
        }
      `}</style>
        </div>
    );
};

export default DiplomaManagement;