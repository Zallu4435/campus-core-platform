import { IDomainEvent } from "../../shared/DomainEvent";
import { User } from "../entities/Auth";

export class UserRegisteredEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public user: User;

    constructor(user: User) {
        this.dateTimeOccurred = new Date();
        this.user = user;
    }

    getAggregateId(): string {
        return this.user.id || '';
    }
}
