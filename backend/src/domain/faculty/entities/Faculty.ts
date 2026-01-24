import { FacultyStatus, FacultyRejectedBy } from "../enums/FacultyEnums";

export interface IFacultyProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  department?: string;
  qualification?: string;
  experience?: string;
  aboutMe?: string;
  cvUrl?: string;
  certificatesUrl?: string[];
  status: FacultyStatus;
  rejectedBy?: FacultyRejectedBy;
  confirmationToken?: string | null;
  tokenExpiry?: Date | null;
  blocked: boolean;
  password?: string; // Optional because we might not always load it
  passwordChangedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Faculty {
  public readonly id?: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly phone?: string;
  public readonly profilePicture?: string;
  public readonly department?: string;
  public readonly qualification?: string;
  public readonly experience?: string;
  public readonly aboutMe?: string;
  public readonly cvUrl?: string;
  public readonly certificatesUrl?: string[];
  public readonly status: FacultyStatus;
  public readonly rejectedBy?: FacultyRejectedBy;
  public readonly confirmationToken?: string | null;
  public readonly tokenExpiry?: Date | null;
  public readonly blocked: boolean;
  public readonly password?: string;
  public readonly passwordChangedAt?: Date;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: IFacultyProps) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.phone = props.phone;
    this.profilePicture = props.profilePicture;
    this.department = props.department;
    this.qualification = props.qualification;
    this.experience = props.experience;
    this.aboutMe = props.aboutMe;
    this.cvUrl = props.cvUrl;
    this.certificatesUrl = props.certificatesUrl;
    this.status = props.status;
    this.rejectedBy = props.rejectedBy;
    this.confirmationToken = props.confirmationToken;
    this.tokenExpiry = props.tokenExpiry;
    this.blocked = props.blocked;
    this.password = props.password;
    this.passwordChangedAt = props.passwordChangedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
