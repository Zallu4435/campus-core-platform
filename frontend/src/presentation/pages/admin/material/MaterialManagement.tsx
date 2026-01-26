import React, { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiFileText, FiClock, FiLock, FiUnlock, FiTag } from 'react-icons/fi';
import { useMaterialManagement } from '../../../../application/hooks/useMaterialManagement';
import WarningModal from '../../../components/common/WarningModal';
import Header from '../../../components/admin/management/Header';
import Pagination from '../../../components/admin/management/Pagination';
import ApplicationsTable from '../../../components/admin/management/ApplicationsTable';
import MaterialForm from './MaterialForm';
import MaterialDetails from './MaterialDetails';
import { Material } from '../../../../domain/types/management/materialmanagement';
import {
  SUBJECTS,
  COURSES,
  SEMESTERS,
  getMaterialColumns,
} from '../../../../shared/constants/materialManagementConstants';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const ITEMS_PER_PAGE = 10;

type MaterialFormData = Partial<Material> | FormData;

const MaterialManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    subject: 'All Subjects',
    course: 'All Courses',
    semester: 'All Semesters',
    status: 'all',
    dateRange: 'all',
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState('all');
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showMaterialDetail, setShowMaterialDetail] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [materialToToggle, setMaterialToToggle] = useState<{ material: Material; isRestricted: boolean } | null>(null);
  const [showToggleWarning, setShowToggleWarning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1)
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const {
    materials,
    totalPages,
    isLoading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    toggleRestrictionMaterial,
    materialDetails,
    isLoadingMaterialDetails,
    handleViewMaterial,
    handleEditMaterial,
  } = useMaterialManagement(page, ITEMS_PER_PAGE, debouncedFilters, debouncedSearchQuery);

  const materialColumns = getMaterialColumns();

  const debouncedFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      subject: 'All Subjects',
      course: 'All Courses',
      semester: 'All Semesters',
      status: 'all',
      dateRange: 'all',
    });
    setSearchQuery('');
    setActiveTab('all');
  };

  const handleTabClick = (index: number) => {
    const tabKeys = ['all', 'restricted', 'unrestricted'];
    const newActiveTab = tabKeys[index];
    setActiveTab(newActiveTab);

    const statusMap: { [key: string]: string } = {
      'all': 'all',
      'restricted': 'restricted',
      'unrestricted': 'unrestricted'
    };

    setFilters(prev => ({
      ...prev,
      status: statusMap[newActiveTab] || 'all'
    }));
  };

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowMaterialModal(true);
  };

  const handleSaveMaterial = async (formData: Partial<Material>) => {
    try {
      console.log('[MaterialManagement] Form data received:', formData);
      let dataToSend: MaterialFormData = formData;

      // Check if there are any file changes (new files uploaded)
      const hasFileChange = formData.file && formData.file instanceof File;
      const hasThumbnailChange = (formData as any).thumbnail && (formData as any).thumbnail instanceof File;

      console.log('[MaterialManagement] File changes detected:', { hasFileChange, hasThumbnailChange });

      if (hasFileChange || hasThumbnailChange) {
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'file' && value instanceof File) {
            fd.append('file', value);
            console.log('[MaterialManagement] Appending file:', value.name);
          } else if (key === 'thumbnail' && value instanceof File) {
            fd.append('thumbnail', value);
            console.log('[MaterialManagement] Appending thumbnail:', value.name);
          } else if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => fd.append(key, v));
            } else {
              fd.append(key, String(value));
            }
          }
        });
        dataToSend = fd;
        console.log('[MaterialManagement] FormData created:', Array.from(fd.entries()));
      } else {
        console.log('[MaterialManagement] No file changes, sending JSON data');
      }

      if (editingMaterial) {
        await updateMaterial({ id: editingMaterial.id, data: dataToSend as Partial<Material> });
      } else {
        await createMaterial(dataToSend as Omit<Material, "_id" | "uploadedAt" | "views" | "downloads" | "rating">);
      }
      setShowMaterialModal(false);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Error saving material:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (materialToDelete) {
      await deleteMaterial(materialToDelete.id);
      setShowDeleteWarning(false);
      setMaterialToDelete(null);
    }
  };

  const handleConfirmToggle = async () => {
    if (materialToToggle) {
      await toggleRestrictionMaterial({ id: materialToToggle.material.id, isRestricted: materialToToggle.isRestricted });
      setShowToggleWarning(false);
      setMaterialToToggle(null);
    }
  };

  type MaterialWithId = Material & { _id: string };
  const paginatedMaterials: MaterialWithId[] = (materials || []).map((m) => ({ ...m, _id: m.id }));

  const materialActions = [
    {
      icon: <FiEye size={16} />,
      label: 'View Material',
      onClick: (material: MaterialWithId) => {
        handleViewMaterial(material.id);
        setShowMaterialDetail(true);
      },
      color: 'blue' as const,
    },
    {
      icon: <FiEdit size={16} />,
      label: 'Edit Material',
      onClick: (material: MaterialWithId) => {
        handleEditMaterial(material.id);
        setEditingMaterial(material);
        setShowMaterialModal(true);
      },
      color: 'green' as const,
    },
    {
      icon: <FiTrash2 size={16} />,
      label: 'Delete Material',
      onClick: (material: MaterialWithId) => {
        setMaterialToDelete(material);
        setShowDeleteWarning(true);
      },
      color: 'red' as const,
    },
    {
      icon: <FiLock size={16} />,
      label: 'Restrict/Unrestrict',
      onClick: (material: MaterialWithId) => {
        setMaterialToToggle({ material, isRestricted: !material.isRestricted });
        setShowToggleWarning(true);
      },
      color: 'red' as const,
    },
  ];


  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage message={error.message} />;
  }

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
          title="Material Management"
          subtitle="Manage educational materials for courses"
          stats={[
            {
              icon: <FiFileText />,
              title: 'Total Materials',
              value: paginatedMaterials.length.toString(),
              change: '+5.2%',
              isPositive: true,
            },
            {
              icon: <FiTag />,
              title: 'Restricted Materials',
              value: paginatedMaterials.filter((m) => m.isRestricted).length.toString(),
              change: '+1.5%',
              isPositive: true,
            },
            {
              icon: <FiClock />,
              title: 'Avg. Views',
              value: Math.round(paginatedMaterials.reduce((acc, m) => acc + m.views, 0) / (paginatedMaterials.length || 1)).toString(),
              change: '+3.8%',
              isPositive: true,
            },
          ]}
          tabs={[
            { label: 'All Materials', icon: <FiFileText size={16} />, active: activeTab === 'all' },
            { label: 'Restricted', icon: <FiLock size={16} />, active: activeTab === 'restricted' },
            { label: 'Unrestricted', icon: <FiUnlock size={16} />, active: activeTab === 'unrestricted' },
          ]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search materials..."
          filters={filters}
          filterOptions={{
            subject: SUBJECTS,
            course: COURSES,
            semester: SEMESTERS,
          }}
          debouncedFilterChange={debouncedFilterChange}
          handleResetFilters={handleResetFilters}
          onTabClick={(index) => handleTabClick(index)}
        />

        <div className="mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-purple-500/20 min-h-[300px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 z-20 rounded-xl">
                <LoadingSpinner />
              </div>
            ) : null}
            <div className={`px-6 py-5 ${isLoading ? 'opacity-50 pointer-events-none select-none' : ''}`}>
              <button
                onClick={handleAddMaterial}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiPlus size={16} />
                Add Material
              </button>

              {paginatedMaterials.length > 0 ? (
                <>
                  <ApplicationsTable
                    data={paginatedMaterials}
                    columns={materialColumns}
                    actions={materialActions}
                  />
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    itemsCount={paginatedMaterials.length}
                    itemName="materials"
                    onPageChange={(p: number) => setPage(p)}
                    onFirstPage={() => setPage(1)}
                    onLastPage={() => setPage(totalPages)}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                    <FiFileText size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No Materials Found</h3>
                  <p className="text-gray-400 text-center max-w-sm">
                    There are no materials matching your current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMaterialModal && (
        <MaterialForm
          isOpen={showMaterialModal}
          onClose={() => setShowMaterialModal(false)}
          onSubmit={handleSaveMaterial}
          initialData={editingMaterial}
          isEditing={!!editingMaterial}
        />
      )}

      {showMaterialDetail && materialDetails && (
        <MaterialDetails
          isOpen={showMaterialDetail}
          onClose={() => setShowMaterialDetail(false)}
          material={materialDetails}
          isLoading={isLoadingMaterialDetails}
        />
      )}

      <WarningModal
        isOpen={showDeleteWarning}
        onClose={() => setShowDeleteWarning(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Material"
        message={materialToDelete ? `Are you sure you want to delete "${materialToDelete.title}"? This action is permanent.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <WarningModal
        isOpen={showToggleWarning}
        onClose={() => setShowToggleWarning(false)}
        onConfirm={handleConfirmToggle}
        title={materialToToggle?.isRestricted ? 'Restrict Material' : 'Unrestrict Material'}
        message={
          materialToToggle
            ? `Are you sure you want to ${materialToToggle.isRestricted ? 'restrict' : 'unrestrict'} "${materialToToggle.material.title}"?`
            : ''
        }
        confirmText={materialToToggle?.isRestricted ? 'Restrict' : 'Unrestrict'}
        cancelText="Cancel"
        type="warning"
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

export default MaterialManagement;