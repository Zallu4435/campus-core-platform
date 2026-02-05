export interface Faculty {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  experience: string;
  cv: string;
  certificates: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  blocked?: boolean;
  cvUrl?: string;
  certificatesUrl?: string[];
  aboutMe?: string;
}

export interface FacultyApprovalData {
  department: string;
  role: string;
  startDate: string;
  additionalNotes?: string;
}

export interface FacultyFilters {
  status: string;
  department: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface FacultyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: Faculty;
  onBlockToggle?: (facultyId: string, blocked: boolean) => void;
}

export interface FacultyApiResponse {
  data: {
    faculty: Faculty[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  };
}

export interface DocumentUploadResult {
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
}

export interface MultipleDocumentUploadResult {
  documents: DocumentUploadResult[];
}

export interface DocumentViewResult {
  pdfData: string;
  fileName: string;
  fileType: string;
}

export interface FacultyRequestResponse {
  message: string;
  requestId: string;
}