/**
 * Domain Event Interface
 * Represents something significant that happened in the domain
 */
export interface IDomainEvent {
    dateTimeOccurred: Date;
    getAggregateId(): string;
}

/**
 * Domain Event Handler Interface
 * Subscribes to and handles specific domain events
 */
export interface IDomainEventHandler<T extends IDomainEvent> {
    handle(event: T): Promise<void>;
}
