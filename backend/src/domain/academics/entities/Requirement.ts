export interface RequirementCategory {
    percentage: number;
    completed: number;
    total: number;
}

export class Requirement {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly core: RequirementCategory,
        public readonly elective: RequirementCategory,
        public readonly general: RequirementCategory
    ) { }
}
