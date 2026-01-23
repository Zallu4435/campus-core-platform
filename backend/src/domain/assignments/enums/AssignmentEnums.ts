export enum AssignmentStatus {
    Draft = 'draft',
    Published = 'published',
    Closed = 'closed'
}

export enum SubmissionStatus {
    Pending = 'pending',
    Submitted = 'submitted',
    Reviewed = 'reviewed',
    Late = 'late',
    NeedsCorrection = 'needs_correction'
}

// For filtering/listing where we might want 'all'
export type AssignmentProcessStatus = AssignmentStatus | SubmissionStatus | 'all' | 'graded';
