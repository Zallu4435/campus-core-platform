import { EventEmitter } from 'events';
import { IEventDispatcher } from '../../domain/shared/IEventDispatcher';
import { IDomainEvent, IDomainEventHandler } from '../../domain/shared/DomainEvent';

/**
 * Concrete implementation of Event Dispatcher using Node.js EventEmitter
 */
export class DomainEventDispatcher implements IEventDispatcher {
    private eventEmitter: EventEmitter;
    private static instance: DomainEventDispatcher;

    private constructor() {
        this.eventEmitter = new EventEmitter();
    }

    static getInstance(): DomainEventDispatcher {
        if (!DomainEventDispatcher.instance) {
            DomainEventDispatcher.instance = new DomainEventDispatcher();
        }
        return DomainEventDispatcher.instance;
    }

    async dispatch(event: IDomainEvent): Promise<void> {
        const eventName = event.constructor.name;
        console.log(`[EventDispatcher] Dispatching ${eventName}`);
        this.eventEmitter.emit(eventName, event);
    }

    async dispatchAll(events: IDomainEvent[]): Promise<void> {
        for (const event of events) {
            await this.dispatch(event);
        }
    }

    /**
     * Register a handler for a specific event
     * @param eventName Name of the event class (e.g. "UserRegisteredEvent")
     * @param handler logic to execute
     */
    register(eventName: string, handler: (event: any) => Promise<void>): void {
        this.eventEmitter.on(eventName, async (event) => {
            try {
                await handler(event);
            } catch (err) {
                console.error(`[EventDispatcher] Error handling ${eventName}:`, err);
            }
        });
    }
}
