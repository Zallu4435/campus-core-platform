import { EventErrorType } from "../enums/EventErrorType";
import { EventRequestProps, EventRequestStatus } from "./EventTypes";

export class EventRequest {
  private idValue?: string;
  private eventIdValue: string | { id: string; title: string; eventType: string; date: string; organizer: string; location: string; description: string };
  private userIdValue: string | { id: string; firstName: string; lastName: string; email: string };
  private statusValue: EventRequestStatus;
  private whyJoinValue: string;
  private additionalInfoValue: string;
  private createdAtValue?: Date;
  private updatedAtValue?: Date;

  constructor(props: EventRequestProps) {
    this.idValue = props.id;
    this.eventIdValue = props.eventId;
    this.userIdValue = props.userId;
    this.statusValue = props.status || EventRequestStatus.Pending;
    this.whyJoinValue = props.whyJoin;
    this.additionalInfoValue = props.additionalInfo || "";
    this.createdAtValue = props.createdAt;
    this.updatedAtValue = props.updatedAt;
  }

  static create(props: EventRequestProps): EventRequest {
    if (!props.eventId) {
      throw new Error(EventErrorType.InvalidEventId);
    }
    if (!props.userId) {
      throw new Error(EventErrorType.InvalidUserId);
    }
    if (!props.whyJoin || props.whyJoin.trim().length === 0) {
      throw new Error(EventErrorType.InvalidWhyJoin);
    }
    return new EventRequest(props);
  }

  get id(): string | undefined { return this.idValue; }
  get eventId(): string | { id: string; title: string; eventType: string; date: string; organizer: string; location: string; description: string } { return this.eventIdValue; }
  get userId(): string | { id: string; firstName: string; lastName: string; email: string } { return this.userIdValue; }
  get status(): EventRequestStatus { return this.statusValue; }
  get whyJoin(): string { return this.whyJoinValue; }
  get additionalInfo(): string { return this.additionalInfoValue; }
  get createdAt(): Date | undefined { return this.createdAtValue; }
  get updatedAt(): Date | undefined { return this.updatedAtValue; }

  // Helper methods to get clean IDs
  get eventIdString(): string {
    return typeof this.eventIdValue === 'string' ? this.eventIdValue : this.eventIdValue.id;
  }

  get userIdString(): string {
    return typeof this.userIdValue === 'string' ? this.userIdValue : this.userIdValue.id;
  }
}