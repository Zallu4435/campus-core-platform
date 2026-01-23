export class Student {
    constructor(
        public readonly id: string,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly email: string,
        public readonly phone?: string,
        public readonly profilePicture?: string,
    ) { }

    public get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
