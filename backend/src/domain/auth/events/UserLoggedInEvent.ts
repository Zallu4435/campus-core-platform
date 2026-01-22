import { IDomainEvent } from "../../shared/DomainEvent";
import { User } from "../entities/Auth";

export class UserLoggedInEvent implements IDomainEvent {
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
