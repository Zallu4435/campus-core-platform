export interface AnalyticsRecentSubmission {
    assignmentTitle: string;
    studentName: string;
    submittedAt: Date;
    score: number;
}

export interface AnalyticsTopPerformer {
    studentId: string;
    studentName: string;
    averageScore: number;
    submissionsCount: number;
}

export interface AnalyticsData {
    totalAssignments: number;
    totalSubmissions: number;
    submissionRate: number;
    averageSubmissionTimeHours: number;
    subjectDistribution: Record<string, { count: number; submissions: number }>;
    statusDistribution: Record<string, { count: number; submissions: number }>;
    recentSubmissions: AnalyticsRecentSubmission[];
    topPerformers: AnalyticsTopPerformer[];
}
