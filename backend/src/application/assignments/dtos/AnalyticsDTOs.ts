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
    subjectDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
    recentSubmissions: AnalyticsRecentSubmission[];
    topPerformers: AnalyticsTopPerformer[];
}
