import { EventErrorType } from "../enums/EventErrorType";
import {
  EventProps,
  OrganizerType,
  EventType,
  Timeframe,
  EventStatus
} from "./EventTypes";

export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class Event {
  private _id?: string;
  private _title: string;
  private _organizer: string;
  private _organizerType: OrganizerType;
  private _eventType: EventType;
  private _date: string;
  private _time: string;
  private _location: string;
  private _timeframe: Timeframe;
  private _status: EventStatus;
  private _icon: string;
  private _color: string;
  private _description: string;
  private _fullTime: boolean;
  private _additionalInfo: string;
  private _requirements: string;
  private _maxParticipants: number;
  private _registrationRequired: boolean;
  private _participants: number;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(props: EventProps) {
    this._id = props.id;
    this._title = props.title;
    this._organizer = props.organizer;
    this._organizerType = props.organizerType;
    this._eventType = props.eventType;
    this._date = props.date;
    this._time = props.time;
    this._location = props.location;
    this._timeframe = props.timeframe;
    this._status = props.status || EventStatus.Upcoming;
    this._icon = props.icon || "📅";
    this._color = props.color || "#8B5CF6";
    this._description = props.description || "";
    this._fullTime = props.fullTime || false;
    this._additionalInfo = props.additionalInfo || "";
    this._requirements = props.requirements || "";
    this._maxParticipants = props.maxParticipants || 0;
    this._registrationRequired = props.registrationRequired || false;
    this._participants = props.participants || 0;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: EventProps): Event {
    if (!props.title || props.title.length < 3) {
      throw new Error(EventErrorType.InvalidTitle);
    }
    if (!props.organizer || props.organizer.length < 2) {
      throw new Error(EventErrorType.InvalidOrganizer);
    }
    if (!props.location || props.location.length < 3) {
      throw new Error(EventErrorType.InvalidLocation);
    }
    return new Event(props);
  }

  get id(): string | undefined { return this._id; }
  get title(): string { return this._title; }
  get organizer(): string { return this._organizer; }
  get organizerType(): OrganizerType { return this._organizerType; }
  get eventType(): EventType { return this._eventType; }
  get date(): string { return this._date; }
  get time(): string { return this._time; }
  get location(): string { return this._location; }
  get timeframe(): Timeframe { return this._timeframe; }
  get status(): EventStatus { return this._status; }
  get icon(): string { return this._icon; }
  get color(): string { return this._color; }
  get description(): string { return this._description; }
  get fullTime(): boolean { return this._fullTime; }
  get additionalInfo(): string { return this._additionalInfo; }
  get requirements(): string { return this._requirements; }
  get maxParticipants(): number { return this._maxParticipants; }
  get registrationRequired(): boolean { return this._registrationRequired; }
  get participants(): number { return this._participants; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }
}
