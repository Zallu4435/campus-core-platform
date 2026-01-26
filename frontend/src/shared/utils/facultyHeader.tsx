import { LuUsers, LuX, LuBookOpen, LuCalendar, LuClock, LuGraduationCap, LuUser, LuClipboardList, LuFileText } from 'react-icons/lu';

export interface SearchResult {
    id: string;
    title: string;
    description: string;
    path: string;
    category: string;
    icon: React.ReactNode;
}

export const facultySearchItems: SearchResult[] = [
    {
        id: 'attendance',
        title: 'Attendance Management',
        description: 'Track and manage student attendance records',
        path: '/faculty/attendance',
        category: 'Student Management',
        icon: <LuUsers className="w-4 h-4" />
    },
    {
        id: 'attendance-summary',
        title: 'Attendance Summary',
        description: 'View attendance reports and statistics',
        path: '/faculty/attendance/summary',
        category: 'Reports',
        icon: <LuX className="w-4 h-4" />
    },

    {
        id: 'assignments',
        title: 'Assignments',
        description: 'Create and manage course assignments',
        path: '/faculty/assignments',
        category: 'Course Management',
        icon: <LuBookOpen className="w-4 h-4" />
    },
    {
        id: 'grade-assignments',
        title: 'Grade Assignments',
        description: 'Grade and provide feedback on student work',
        path: '/faculty/assignments/grading',
        category: 'Course Management',
        icon: <LuX className="w-4 h-4" />
    },

    {
        id: 'sessions',
        title: 'Class Sessions',
        description: 'Manage class schedules and sessions',
        path: '/faculty/sessions',
        category: 'Course Management',
        icon: <LuCalendar className="w-4 h-4" />
    },
    {
        id: 'session-records',
        title: 'Session Records',
        description: 'View and manage class session records',
        path: '/faculty/sessions/records',
        category: 'Course Management',
        icon: <LuClock className="w-4 h-4" />
    },

    {
        id: 'students',
        title: 'Student Directory',
        description: 'View and manage student information',
        path: '/faculty/students',
        category: 'Student Management',
        icon: <LuGraduationCap className="w-4 h-4" />
    },
    {
        id: 'student-progress',
        title: 'Student Progress',
        description: 'Track individual student academic progress',
        path: '/faculty/students/progress',
        category: 'Student Management',
        icon: <LuX className="w-4 h-4" />
    },

    {
        id: 'courses',
        title: 'My Courses',
        description: 'Manage assigned courses and materials',
        path: '/faculty/courses',
        category: 'Course Management',
        icon: <LuBookOpen className="w-4 h-4" />
    },
    {
        id: 'course-materials',
        title: 'Course Materials',
        description: 'Upload and organize course materials',
        path: '/faculty/courses/materials',
        category: 'Course Management',
        icon: <LuFileText className="w-4 h-4" />
    },

    {
        id: 'academic-reports',
        title: 'Academic Reports',
        description: 'Generate and view academic performance reports',
        path: '/faculty/reports',
        category: 'Reports',
        icon: <LuX className="w-4 h-4" />
    },
    {
        id: 'grade-book',
        title: 'Grade Book',
        description: 'Manage student grades and transcripts',
        path: '/faculty/grades',
        category: 'Reports',
        icon: <LuClipboardList className="w-4 h-4" />
    },

    {
        id: 'profile',
        title: 'My Profile',
        description: 'Update personal and professional information',
        path: '/faculty/settings',
        category: 'Settings',
        icon: <LuUser className="w-4 h-4" />
    },
    // Preferences entry hidden per requirement
];

export interface HeaderProps {
    currentDate: string;
    facultyName: string;
    onLogout: () => void;
    setActiveTab?: (tab: string) => void;
    profilePicture?: string;
}