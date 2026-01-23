export class Progress {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly overallProgress: number,
        public readonly totalCredits: number,
        public readonly completedCredits: number,
        public readonly remainingCredits: number,
        public readonly estimatedGraduation: string
    ) { }
}
