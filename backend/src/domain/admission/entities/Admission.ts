import {
  AdmissionDraftProps,
  AdmissionProps,
  AdmissionStatus,
  RejectedBy,
} from "./AdmissionTypes";
import { AdmissionErrorType } from "../enums/AdmissionErrorType";

export class AdmissionDraft {
  private idValue?: string;
  private applicationId: string;
  private registerId: string;
  private personalInfo: Record<string, unknown>;
  private choiceOfStudy: Record<string, unknown>[];
  private education: Record<string, unknown>;
  private achievements: Record<string, unknown>;
  private otherInformation: Record<string, unknown>;
  private documents: Record<string, unknown>;
  private declaration: Record<string, unknown>;
  private completedSteps: string[];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: AdmissionDraftProps) {
    this.idValue = props.id;
    this.applicationId = props.applicationId;
    this.registerId = props.registerId;
    this.personalInfo = props.personalInfo || {};
    this.choiceOfStudy = props.choiceOfStudy || [];
    this.education = props.education || {};
    this.achievements = props.achievements || {};
    this.otherInformation = props.otherInformation || {};
    this.documents = props.documents || {};
    this.declaration = props.declaration || {};
    this.completedSteps = props.completedSteps || [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: AdmissionDraftProps): AdmissionDraft {
    if (!props.applicationId) {
      throw new Error(AdmissionErrorType.InvalidApplicationId);
    }
    return new AdmissionDraft(props);
  }

  get id(): string | undefined { return this.idValue; }
  getApplicationId(): string { return this.applicationId; }
  getRegisterId(): string { return this.registerId; }
  getPersonalInfo() { return this.personalInfo; }
  getChoiceOfStudy() { return this.choiceOfStudy; }
  getEducation() { return this.education; }
  getAchievements() { return this.achievements; }
  getOtherInformation() { return this.otherInformation; }
  getDocuments() { return this.documents; }
  getDeclaration() { return this.declaration; }
  getCompletedSteps(): string[] { return this.completedSteps; }
  getCreatedAt(): Date | undefined { return this.createdAt; }
  getUpdatedAt(): Date | undefined { return this.updatedAt; }

  addCompletedStep(step: string): void {
    if (!this.completedSteps.includes(step)) {
      this.completedSteps.push(step);
    }
  }

  updateSection(section: string, data: Record<string, unknown> | Record<string, unknown>[]): void {
    if (section === 'personalInfo') this.personalInfo = data as Record<string, unknown>;
    else if (section === 'choiceOfStudy') {
      if (Array.isArray(data)) {
        this.choiceOfStudy = data;
      } else {
        // If single object is passed, wrap in array or handle logic (assuming explicit array based on type def)
        // For partial updates, this logic might need refinement, but for now enforcing array if target is array
        this.choiceOfStudy = [data as Record<string, unknown>];
      }
    }
    else if (section === 'education') this.education = data as Record<string, unknown>;
    else if (section === 'achievements') this.achievements = data as Record<string, unknown>;
    else if (section === 'otherInformation') this.otherInformation = data as Record<string, unknown>;
    else if (section === 'documents') this.documents = data as Record<string, unknown>;
    else if (section === 'declaration') this.declaration = data as Record<string, unknown>;
  }
}

export class Admission extends AdmissionDraft {
  private paymentId: string;
  private status: AdmissionStatus;
  private rejectedByValue: RejectedBy | null;
  private confirmationToken: string | null;
  private tokenExpiry: Date | null;

  constructor(props: AdmissionProps) {
    super(props);
    this.paymentId = props.paymentId;
    this.status = props.status || AdmissionStatus.PENDING;
    this.rejectedByValue = props.rejectedBy || null;
    this.confirmationToken = props.confirmationToken || null;
    this.tokenExpiry = props.tokenExpiry || null;
  }

  static create(props: AdmissionProps): Admission {
    if (!props.paymentId) {
      throw new Error(AdmissionErrorType.InvalidPaymentId);
    }
    return new Admission(props);
  }

  getPaymentId(): string { return this.paymentId; }
  getStatus(): AdmissionStatus { return this.status; }
  get rejectedBy(): RejectedBy | null { return this.rejectedByValue; }
  getConfirmationToken(): string | null { return this.confirmationToken; }
  getTokenExpiry(): Date | null { return this.tokenExpiry; }
}