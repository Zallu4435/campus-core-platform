import { SportRequestProps, SportRequestStatus } from "./SportTypes";

export class SportRequest {
  private _id?: string;
  private _sportId: string | { _id: string; title: string; type: string };
  private _userId: string | { _id: string; email: string; firstName?: string; lastName?: string };
  private _status: SportRequestStatus;
  private _whyJoin: string;
  private _additionalInfo: string;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(props: SportRequestProps) {
    this._id = props.id;
    this._sportId = props.sportId;
    this._userId = props.userId;
    this._status = props.status || SportRequestStatus.Pending;
    this._whyJoin = props.whyJoin;
    this._additionalInfo = props.additionalInfo || "";
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: SportRequestProps): SportRequest {
    if (!props.sportId) {
      throw new Error("Invalid sport ID");
    }
    if (!props.userId) {
      throw new Error("Invalid user ID");
    }
    if (!props.whyJoin || props.whyJoin.trim().length === 0) {
      throw new Error("Reason for joining is required");
    }
    return new SportRequest(props);
  }

  get id(): string | undefined { return this._id; }
  get sportId(): string | { _id: string; title: string; type: string } { return this._sportId; }
  get userId(): string | { _id: string; email: string; firstName?: string; lastName?: string } { return this._userId; }
  get status(): SportRequestStatus { return this._status; }
  get whyJoin(): string { return this._whyJoin; }
  get additionalInfo(): string { return this._additionalInfo; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }
}