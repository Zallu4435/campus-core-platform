import { ClubErrorType } from "../enums/ClubErrorType";
import { ClubRequestProps, ClubRequestStatus } from "./ClubTypes";

export class ClubRequest {
  private idValue?: string;
  private clubIdValue: string | { id: string; name: string; type: string; about: string; nextMeeting: string; enteredMembers: number };
  private userIdValue: string | { id: string; firstName: string; lastName: string; email: string };
  private statusValue: ClubRequestStatus;
  private whyJoinValue: string;
  private additionalInfoValue: string;

  constructor(props: ClubRequestProps) {
    this.idValue = props.id;
    this.clubIdValue = props.clubId;
    this.userIdValue = props.userId;
    this.statusValue = props.status || ClubRequestStatus.Pending;
    this.whyJoinValue = props.whyJoin;
    this.additionalInfoValue = props.additionalInfo || "";
  }

  static create(props: ClubRequestProps): ClubRequest {
    if (!props.clubId) {
      throw new Error(ClubErrorType.InvalidClubId);
    }
    if (!props.userId) {
      throw new Error(ClubErrorType.InvalidUserId);
    }
    if (!props.whyJoin || props.whyJoin.trim().length === 0) {
      throw new Error(ClubErrorType.InvalidWhyJoin);
    }
    return new ClubRequest(props);
  }

  get id(): string | undefined { return this.idValue; }
  get clubId(): string | { id: string; name: string; type: string; about: string; nextMeeting: string; enteredMembers: number } { return this.clubIdValue; }
  get userId(): string | { id: string; firstName: string; lastName: string; email: string } { return this.userIdValue; }
  get status(): ClubRequestStatus { return this.statusValue; }
  get whyJoin(): string { return this.whyJoinValue; }
  get additionalInfo(): string { return this.additionalInfoValue; }

  // Helper methods to get clean IDs
  get clubIdString(): string {
    return typeof this.clubIdValue === 'string' ? this.clubIdValue : this.clubIdValue.id;
  }

  get userIdString(): string {
    return typeof this.userIdValue === 'string' ? this.userIdValue : this.userIdValue.id;
  }
}