export class Course {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly specialization: string,
        public readonly faculty: string,
        public readonly credits: number,
        public readonly term: string,
        public readonly maxEnrollment: number,
        public readonly currentEnrollment: number,
        public readonly createdAt: Date,
        public readonly schedule?: string,
        public readonly description?: string,
        public readonly prerequisites: string[] = []
    ) { }

    public get isFull(): boolean {
        return this.currentEnrollment >= this.maxEnrollment;
    }
}
