import { AdmissionErrorType } from "../enums/AdmissionErrorType";
import {
  AdminAdmission,
  AdminAdmissionStatus,
  AdminAdmissionChoiceOfStudy,
  AdminAdmissionPersonal
} from "./AdminAdmissionTypes";

export interface AdmissionProps extends AdminAdmission { }

export class Admission {
  private idValue?: string;
  private _registerId: string;
  private _applicationId: string;
  private _personal: AdminAdmissionPersonal;
  private _choiceOfStudy: AdminAdmissionChoiceOfStudy[];
  private _status: AdminAdmissionStatus;
  private _confirmationToken?: string;
  private _tokenExpiry?: Date;
  private _rejectedBy?: string;
  private _createdAt?: Date;

  constructor(props: AdmissionProps) {
    this.idValue = props.id;
    this._registerId = props.registerId;
    this._applicationId = props.applicationId;
    this._personal = props.personal;
    this._choiceOfStudy = props.choiceOfStudy;
    this._status = props.status;
    this._confirmationToken = props.confirmationToken;
    this._tokenExpiry = props.tokenExpiry;
    this._rejectedBy = props.rejectedBy;
    this._createdAt = props.createdAt;
  }

  static create(props: AdmissionProps): Admission {
    if (!props.registerId || !props.applicationId || !props.personal.fullName || !props.personal.emailAddress) {
      throw new Error(AdmissionErrorType.MissingRequiredFields);
    }
    return new Admission(props);
  }

  get id(): string | undefined { return this.idValue; }
  get registerId(): string { return this._registerId; }
  get applicationId(): string { return this._applicationId; }
  get personal(): AdminAdmissionPersonal { return this._personal; }
  get choiceOfStudy(): AdminAdmissionChoiceOfStudy[] { return this._choiceOfStudy; }
  get status(): AdminAdmissionStatus { return this._status; }
  get confirmationToken(): string | undefined { return this._confirmationToken; }
  get tokenExpiry(): Date | undefined { return this._tokenExpiry; }
  get rejectedBy(): string | undefined { return this._rejectedBy; }
  get createdAt(): Date | undefined { return this._createdAt; }

  updateStatus(status: AdminAdmissionStatus, rejectedBy?: string): void {
    if (!["pending", "approved", "rejected", "offered"].includes(status)) {
      throw new Error(AdmissionErrorType.InvalidStatus);
    }
    this._status = status;
    this._rejectedBy = rejectedBy;
  }

  setConfirmationToken(token: string, expiry: Date): void {
    this._confirmationToken = token;
    this._tokenExpiry = expiry;
  }

  clearConfirmationToken(): void {
    this._confirmationToken = undefined;
    this._tokenExpiry = undefined;
  }
}