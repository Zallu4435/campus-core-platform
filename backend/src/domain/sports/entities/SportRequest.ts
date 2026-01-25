import { SportRequestProps, SportRequestStatus } from "./SportTypes";

export class SportRequest {
  private idValue?: string;
  private sportIdValue: string | { id: string; title: string; type: string };
  private userIdValue: string | { id: string; email: string; firstName?: string; lastName?: string };
  private statusValue: SportRequestStatus;
  private whyJoinValue: string;
  private additionalInfoValue: string;
  private createdAtValue?: Date;
  private updatedAtValue?: Date;

  constructor(props: SportRequestProps) {
    this.idValue = props.id;
    this.sportIdValue = props.sportId;
    this.userIdValue = props.userId;
    this.statusValue = props.status || SportRequestStatus.Pending;
    this.whyJoinValue = props.whyJoin;
    this.additionalInfoValue = props.additionalInfo || "";
    this.createdAtValue = props.createdAt;
    this.updatedAtValue = props.updatedAt;
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

  get id(): string | undefined { return this.idValue; }
  get sportId(): string | { id: string; title: string; type: string } { return this.sportIdValue; }
  get userId(): string | { id: string; email: string; firstName?: string; lastName?: string } { return this.userIdValue; }
  get status(): SportRequestStatus { return this.statusValue; }
  get whyJoin(): string { return this.whyJoinValue; }
  get additionalInfo(): string { return this.additionalInfoValue; }
  get createdAt(): Date | undefined { return this.createdAtValue; }
  get updatedAt(): Date | undefined { return this.updatedAtValue; }

  // Helper methods to get clean IDs
  get sportIdString(): string {
    return typeof this.sportIdValue === 'string' ? this.sportIdValue : this.sportIdValue.id;
  }

  get userIdString(): string {
    return typeof this.userIdValue === 'string' ? this.userIdValue : this.userIdValue.id;
  }
}