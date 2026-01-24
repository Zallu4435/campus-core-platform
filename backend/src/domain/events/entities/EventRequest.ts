import { EventErrorType } from "../enums/EventErrorType";
import { EventRequestProps, EventRequestStatus } from "./EventTypes";

export class EventRequest {
  private _id?: string;
  private _eventId: string | { _id: string; title: string; eventType: string; date: string; organizer: string; location: string; description: string };
  private _userId: string | { _id: string; firstName: string; lastName: string; email: string };
  private _status: EventRequestStatus;
  private _whyJoin: string;
  private _additionalInfo: string;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(props: EventRequestProps) {
    this._id = props.id;
    this._eventId = props.eventId;
    this._userId = props.userId;
    this._status = props.status || EventRequestStatus.Pending;
    this._whyJoin = props.whyJoin;
    this._additionalInfo = props.additionalInfo || "";
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
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

  get id(): string | undefined { return this._id; }
  get eventId(): string | { _id: string; title: string; eventType: string; date: string; organizer: string; location: string; description: string } { return this._eventId; }
  get userId(): string | { _id: string; firstName: string; lastName: string; email: string } { return this._userId; }
  get status(): EventRequestStatus { return this._status; }
  get whyJoin(): string { return this._whyJoin; }
  get additionalInfo(): string { return this._additionalInfo; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }
}