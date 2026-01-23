export class TranscriptRequest {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly deliveryMethod: string,
        public readonly requestedAt: Date,
        public readonly estimatedDelivery: Date,
        public readonly requestId: string,
        public readonly address?: string,
        public readonly email?: string,
    ) { }
}
