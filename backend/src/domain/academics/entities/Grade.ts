export class Grade {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly cumulativeGPA: string,
        public readonly termGPA: string,
        public readonly termName: string,
        public readonly creditsEarned: string,
        public readonly creditsInProgress: string,
    ) { }
}
