import { IDomainEvent } from "./DomainEvent";

/**
 * Interface for dispatching domain events
 */
export interface IEventDispatcher {
    dispatch(event: IDomainEvent): Promise<void>;
    dispatchAll(events: IDomainEvent[]): Promise<void>;
}
