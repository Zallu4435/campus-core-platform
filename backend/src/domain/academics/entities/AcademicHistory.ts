export class AcademicHistory {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly term: string,
        public readonly credits: string,
        public readonly gpa: string,
    ) { }
}
