import { IDomainEvent } from "./DomainEvent";

/**
 * Aggregate Root Base Class
 * Entities that act as aggregate roots should extend this class
 * Manages domain events
 */
export abstract class AggregateRoot {
    private _domainEvents: IDomainEvent[] = [];

    /**
     * Get all uncommitted domain events
     */
    get domainEvents(): IDomainEvent[] {
        return this._domainEvents;
    }

    /**
     * Add a domain event to the collection
     * @param event The domain event to add
     */
    protected addDomainEvent(event: IDomainEvent): void {
        // Add the event to this aggregate's list of domain events
        this._domainEvents.push(event);
        // Log the event (optional integration point for logging)
        console.log(`[Domain Event Created]: ${event.constructor.name}`, event);
    }

    /**
     * Clear all domain events
     * Should be called after events are dispatched/persisted
     */
    public clearEvents(): void {
        this._domainEvents = [];
    }
}
