import { FiUser, FiMail, FiBriefcase, FiCalendar } from 'react-icons/fi';
import { Faculty } from '../../domain/types/management/facultyManagement';
import { formatDate } from '../utils/dateUtils';

export interface ColumnConfig<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

export const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Humanities',
  'Business',
];

export const STATUSES = ['All Statuses', 'Pending', 'Approved', 'Rejected'];

export const facultyColumns: ColumnConfig<Faculty>[] = [
  {
    header: 'Applicant',
    key: 'fullName',
    render: (faculty: Faculty) => (
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm"></div>
          <span className="relative z-10 font-medium text-lg">
            {faculty.fullName?.[0]?.toUpperCase() || <FiUser />}
          </span>
        </div>
        <div className="ml-3">
          <p className="font-medium text-gray-200">{faculty.fullName || 'N/A'}</p>
          <p className="text-xs text-gray-400">ID: {faculty._id ? faculty._id.substring(0, 8) : 'N/A'}</p>
        </div>
      </div>
    ),
    width: '20%',
  },
  {
    header: 'Email',
    key: 'email',
    render: (faculty: Faculty) => (
      <div className="flex items-center text-gray-300">
        <FiMail size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{faculty.email || 'N/A'}</span>
      </div>
    ),
  },
  {
    header: 'Department',
    key: 'department',
    render: (faculty: Faculty) => (
      <div className="flex items-center text-gray-300">
        <FiBriefcase size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{faculty.department || 'N/A'}</span>
      </div>
    ),
  },
  {
    header: 'Applied On',
    key: 'createdAt',
    render: (faculty: Faculty) => (
      <div className="flex items-center text-gray-300">
        <FiCalendar size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{formatDate(faculty.createdAt)}</span>
      </div>
    ),
  },
  {
    header: 'Status',
    key: 'status',
    render: (faculty: Faculty) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${faculty.status.toLowerCase() === 'approved'
          ? 'bg-green-900/30 text-green-400 border-green-500/30'
          : faculty.status.toLowerCase() === 'rejected'
            ? 'bg-red-900/30 text-red-400 border-red-500/30'
            : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
          }`}
        role="status"
      >
        <span
          className="h-1.5 w-1.5 rounded-full mr-1.5"
          style={{ boxShadow: `0 0 8px currentColor`, backgroundColor: 'currentColor' }}
        ></span>
        {faculty.status?.charAt(0).toUpperCase() + faculty.status?.slice(1) || 'Pending'}
      </span>
    ),
  },
];

export const ghostParticles = Array(30)
  .fill(0)
  .map((_) => ({
    size: Math.random() * 10 + 5,
    top: Math.random() * 100,
    left: Math.random() * 100,
    animDuration: Math.random() * 10 + 15,
    animDelay: Math.random() * 5,
  }));