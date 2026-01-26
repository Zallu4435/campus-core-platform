export interface Assignment {
  id?: string;
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  maxMarks: number;
  description: string;
  files: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }> | string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'closed';
  totalSubmissions: number;
  averageMarks?: number;
  submissionCount?: number;
  averageMark?: number;
}

export interface Submission {
  _id: string;
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedDate: string;
  status: 'pending' | 'reviewed' | 'late' | 'needs_correction';
  marks: number;
  feedback: string;
  isLate: boolean;
  files: string[] | Array<{ fileName: string; fileUrl: string; fileSize: number }>;
  fileName: string;
  fileSize: number;
}

export interface ReviewData {
  marks: number;
  status: 'pending' | 'reviewed' | 'needs_correction';
  feedback: string;
}

export interface NewAssignment {
  title: string;
  subject: string;
  dueDate: string;
  maxMarks: string;
  description: string;
  files: File[];
}

export interface Analytics {
  totalAssignments: number;
  totalSubmissions: number;
  averageMarks: number;
  submissionStatus: {
    pending: number;
    reviewed: number;
    needs_correction: number;
    late: number;
  };
  lateSubmissions: number;
  submissionsByDate: {
    date: string;
    count: number;
  }[];
  marksDistribution: {
    range: string;
    count: number;
  }[];
}

export interface AnalyticsProps {
  analytics: {
    totalAssignments: number;
    totalSubmissions: number;
    submissionRate: number;
    averageSubmissionTimeHours: number;
    subjectDistribution: {
      [key: string]: {
        count: number;
        submissions: number;
      };
    };
    statusDistribution: {
      [key: string]: {
        count: number;
        submissions: number;
      };
    };
    recentSubmissions: Array<{
      assignmentTitle: string;
      studentName: string;
      submittedAt: Date;
      score: number;
    }>;
    topPerformers: Array<{
      studentId: string;
      studentName: string;
      averageScore: number;
      submissionsCount: number;
    }>;
  } | null;
  isLoading: boolean;
  onShow: () => void;
  onHide: () => void;
}

export interface AssignmentCardProps {
  assignment: Assignment;
  onViewSubmissions: (assignment: Assignment) => void;
  onDelete: (id: string) => Promise<boolean>;
  getSubjectIcon: (subject: string) => string;
  getStatusColor: (status: string) => string;
}

export interface AssignmentListProps {
  assignments: Assignment[];
  isLoading: boolean;
  error: unknown;
  setSelectedAssignment: (assignment: Assignment | null) => void;
  setActiveTab: (tab: string) => void;
  setShowCreateModal: (show: boolean) => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  isDeleting: boolean;
  onUpdate: (id: string, data: Partial<Omit<Assignment, 'files'>> & { files?: File[] }) => Promise<{ success: boolean; error?: string }>;
  isUpdating: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterSubject: string;
  setFilterSubject: (v: string) => void;
  debouncedSearchTerm: string;
}

export interface CreateAssignmentModalProps {
  newAssignment: NewAssignment;
  setNewAssignment: (assignment: NewAssignment) => void;
  setShowCreateModal: (show: boolean) => void;
  onSubmit: (assignment: NewAssignment) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  selectedAssignment: Assignment | null;
  onUpdate?: (id: string, data: Partial<Omit<Assignment, 'files'>> & { files?: File[] }) => Promise<{ success: boolean; error?: string }>;
  setActiveTab: (tab: string) => void;
  setSelectedAssignment: (assignment: Assignment | null) => void;
}

export interface ReviewModalProps {
  submission: {
    id: string;
    studentName: string;
    studentId: string;
    submittedDate: string;
    status: 'reviewed' | 'pending' | 'needs_correction';
    marks: number | null;
    feedback: string;
    isLate: boolean;
    fileName: string;
    fileSize: string;
  };
  saveReview: (submissionId: string, reviewData: { marks: number; feedback: string; status: 'reviewed' | 'pending' | 'needs_correction'; isLate: boolean }) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export interface SubmissionsProps {
  assignment: Assignment;
  submissions: Submission[];
  onReview: (submissionId: string, reviewData: {
    marks: number;
    feedback: string;
    status: 'reviewed' | 'pending' | 'needs_correction';
    isLate: boolean;
  }) => void;
  onDownload: (submissionId: string) => void;
  setShowReviewModal: (show: boolean) => void;
  isLoading?: boolean;
  isReviewing?: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filterStatus: string;
  setFilterStatus: (s: any) => void;
  error?: any;
}
