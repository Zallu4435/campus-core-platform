import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import AssignmentList from './AssignmentList';
import Submissions from './Submissions';
import Analytics from './Analytics';
import CreateAssignmentModal from './CreateAssignmentModal';
import { useAssignmentManagement } from './hooks/useAssignmentManagement';
import { assignmentService } from './services/assignmentService';
import { NewAssignment, Submission } from '../../../../domain/types/faculty/assignment';

export default function AssignmentManagement() {
    const [activeTab, setActiveTab] = useState('all-assignments');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAssignment, setNewAssignment] = useState<NewAssignment>({
        title: '',
        subject: '',
        dueDate: '',
        maxMarks: '',
        description: '',
        files: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSubject, setFilterSubject] = useState('all');
    const [submissionSearch, setSubmissionSearch] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState('all');
    const [debouncedSubmissionSearch, setDebouncedSubmissionSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSubmissionSearch(submissionSearch);
        }, 400);
        return () => clearTimeout(handler);
    }, [submissionSearch]);

    const {
        assignments,
        submissions,
        analytics,
        selectedAssignment,
        isLoading,
        error,
        setSelectedAssignment,
        setShowAnalytics,
        handleCreateAssignment,
        handleUpdateAssignment,
        handleDeleteAssignment,
        handleReviewSubmission,
        isCreating,
        isUpdating,
        isDeleting,
        isReviewing
    } = useAssignmentManagement({
        searchTerm: debouncedSearchTerm,
        filterStatus,
        filterSubject,
        submissionSearch: debouncedSubmissionSearch,
        submissionStatus
    });

    const handleReview = async (submissionId: string, reviewData: {
        marks: number;
        feedback: string;
        status: 'reviewed' | 'pending' | 'needs_correction';
        isLate: boolean;
    }) => {
        if (!selectedAssignment) return;
        await handleReviewSubmission(selectedAssignment._id, submissionId, reviewData);
    };

    const handleDownload = async (submissionId: string) => {
        if (!selectedAssignment) return;
        const submission = submissions?.find((s: Submission) => s._id === submissionId);
        if (submission?.files && submission.files.length > 0) {
            for (const file of submission.files) {
                const fileUrl = typeof file === 'string' ? file : file.fileUrl;
                const fileName = typeof file === 'string' ? file.split('/').pop()?.split('?')[0] || 'file' : file.fileName;
                await assignmentService.downloadSubmissionFile(fileUrl, fileName);
            }
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (tabId === 'submissions' && !selectedAssignment) {
            setActiveTab('all-assignments');
        }
        if (tabId === 'analytics') {
            setShowAnalytics(true);
        } else {
            setShowAnalytics(false);
        }
    };

    const tabs = [
        { id: 'all-assignments', name: 'All Assignments', icon: '📚' },
        { id: 'submissions', name: 'Submissions', icon: '📝' },
        { id: 'analytics', name: 'Analytics', icon: '📊' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-2 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="inline-flex items-center space-x-3 bg-white/95 backdrop-blur-xl rounded-3xl px-8 py-6 shadow-2xl border border-pink-100">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-3xl">📋</span>
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Assignment Management
                            </h1>
                            <p className="text-pink-600 text-sm">Manage and track student assignments efficiently</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-pink-100">
                        <div className="flex space-x-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`px-5 py-2 rounded-2xl text-base font-semibold transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                        : 'text-pink-700 hover:bg-pink-50 hover:text-pink-600'}
                          `}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <span className="text-lg">+</span>
                            <span>Create Assignment</span>
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="transition-all duration-500 ease-in-out">
                            {activeTab === 'all-assignments' && (
                                <div className="animate-fadeIn">
                                    <AssignmentList
                                        assignments={assignments}
                                        isLoading={isLoading}
                                        error={error}
                                        setSelectedAssignment={setSelectedAssignment}
                                        setActiveTab={setActiveTab}
                                        setShowCreateModal={setShowCreateModal}
                                        onDelete={handleDeleteAssignment}
                                        isDeleting={isDeleting}
                                        onUpdate={handleUpdateAssignment}
                                        isUpdating={isUpdating}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        filterStatus={filterStatus}
                                        setFilterStatus={setFilterStatus}
                                        filterSubject={filterSubject}
                                        setFilterSubject={setFilterSubject}
                                        debouncedSearchTerm={debouncedSearchTerm}
                                    />
                                </div>
                            )}
                            {activeTab === 'submissions' && selectedAssignment && (
                                <div className="animate-fadeIn">
                                    <Submissions
                                        assignment={{ ...selectedAssignment, id: selectedAssignment._id }}
                                        submissions={submissions}
                                        onReview={handleReview}
                                        onDownload={handleDownload}
                                        setShowReviewModal={() => { }}
                                        isLoading={isLoading}
                                        isReviewing={isReviewing}
                                        searchTerm={submissionSearch}
                                        setSearchTerm={setSubmissionSearch}
                                        filterStatus={submissionStatus}
                                        setFilterStatus={setSubmissionStatus}
                                        error={error}
                                    />
                                </div>
                            )}
                            {activeTab === 'analytics' && (
                                <div className="animate-fadeIn">
                                    <Analytics
                                        analytics={analytics}
                                        isLoading={isLoading}
                                        onShow={() => setShowAnalytics(true)}
                                        onHide={() => setShowAnalytics(false)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {showCreateModal && (
                <CreateAssignmentModal
                    newAssignment={newAssignment}
                    setNewAssignment={setNewAssignment}
                    setShowCreateModal={setShowCreateModal}
                    onSubmit={handleCreateAssignment}
                    isLoading={isCreating}
                    selectedAssignment={selectedAssignment}
                    onUpdate={handleUpdateAssignment}
                    setActiveTab={setActiveTab}
                    setSelectedAssignment={setSelectedAssignment}
                />
            )}
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    );
}