import { EventErrorType } from "../enums/EventErrorType";
import {
  EventProps,
  OrganizerType,
  EventType,
  Timeframe,
  EventStatus
} from "./EventTypes";

export interface PopulatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class Event {
  private idValue?: string;
  private titleValue: string;
  private organizerValue: string;
  private organizerTypeValue: OrganizerType;
  private eventTypeValue: EventType;
  private dateValue: string;
  private timeValue: string;
  private locationValue: string;
  private timeframeValue: Timeframe;
  private statusValue: EventStatus;
  private iconValue: string;
  private colorValue: string;
  private descriptionValue: string;
  private fullTimeValue: boolean;
  private additionalInfoValue: string;
  private requirementsValue: string;
  private maxParticipantsValue: number;
  private registrationRequiredValue: boolean;
  private participantsValue: number;
  private createdAtValue?: Date;
  private updatedAtValue?: Date;

  constructor(props: EventProps) {
    this.idValue = props.id;
    this.titleValue = props.title;
    this.organizerValue = props.organizer;
    this.organizerTypeValue = props.organizerType;
    this.eventTypeValue = props.eventType;
    this.dateValue = props.date;
    this.timeValue = props.time;
    this.locationValue = props.location;
    this.timeframeValue = props.timeframe || Timeframe.Morning;

    this.statusValue = props.status || EventStatus.Upcoming;
    this.iconValue = props.icon || "📅";
    this.colorValue = props.color || "#8B5CF6";
    this.descriptionValue = props.description || "";
    this.fullTimeValue = props.fullTime || false;
    this.additionalInfoValue = props.additionalInfo || "";
    this.requirementsValue = props.requirements || "";
    this.maxParticipantsValue = props.maxParticipants || 0;
    this.registrationRequiredValue = props.registrationRequired || false;
    this.participantsValue = props.participants || 0;
    this.createdAtValue = props.createdAt;
    this.updatedAtValue = props.updatedAt;
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

  get id(): string | undefined { return this.idValue; }
  get title(): string { return this.titleValue; }
  get organizer(): string { return this.organizerValue; }
  get organizerType(): OrganizerType { return this.organizerTypeValue; }
  get eventType(): EventType { return this.eventTypeValue; }
  get date(): string { return this.dateValue; }
  get time(): string { return this.timeValue; }
  get location(): string { return this.locationValue; }
  get timeframe(): Timeframe { return this.timeframeValue; }
  get status(): EventStatus { return this.statusValue; }
  get icon(): string { return this.iconValue; }
  get color(): string { return this.colorValue; }
  get description(): string { return this.descriptionValue; }
  get fullTime(): boolean { return this.fullTimeValue; }
  get additionalInfo(): string { return this.additionalInfoValue; }
  get requirements(): string { return this.requirementsValue; }
  get maxParticipants(): number { return this.maxParticipantsValue; }
  get registrationRequired(): boolean { return this.registrationRequiredValue; }
  get participants(): number { return this.participantsValue; }
  get createdAt(): Date | undefined { return this.createdAtValue; }
  get updatedAt(): Date | undefined { return this.updatedAtValue; }
}
