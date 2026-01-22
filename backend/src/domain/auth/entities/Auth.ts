import { UserProps, FacultyProps } from "./AuthTypes";
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { PersonName } from '../value-objects/PersonName';
import { PhoneNumber } from '../value-objects/PhoneNumber';
import { UserId } from '../value-objects/UserId';
import { ValidationError } from '../errors/AuthErrors';

import { AggregateRoot } from "../../shared/AggregateRoot";
import { UserRegisteredEvent } from "../events/UserRegisteredEvent";
import { PasswordChangedEvent } from "../events/PasswordChangedEvent";

/**
 * User Entity - Domain Model
 * Represents a user in the system with proper encapsulation and value objects
 */
export class User extends AggregateRoot {
  private _id?: UserId;
  private _name: PersonName;
  private _email: Email;
  private _password: Password;
  private _profilePicture?: string;
  private _blocked: boolean;
  private _pending: boolean;

  private constructor(props: {
    id?: UserId;
    name: PersonName;
    email: Email;
    password: Password;
    profilePicture?: string;
    blocked?: boolean;
    pending?: boolean;
  }) {
    super(); // Initialize AggregateRoot
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._profilePicture = props.profilePicture;
    this._blocked = props.blocked || false;
    this._pending = props.pending || false;
  }

  /**
   * Create a new User entity
   * Accepts primitive strings and creates value objects internally
   */
  static create(props: UserProps): User {
    // Validate required fields
    if (!props.firstName?.trim()) {
      throw new ValidationError('First name is required');
    }
    if (!props.lastName?.trim()) {
      throw new ValidationError('Last name is required');
    }
    if (!props.email) {
      throw new ValidationError('Email is required');
    }
    if (!props.password) {
      throw new ValidationError('Password is required');
    }

    // Create value objects (they handle their own validation)
    const name = PersonName.create(props.firstName, props.lastName);
    const email = Email.create(props.email);
    const password = Password.create(props.password);
    const id = props.id ? UserId.createOrNull(props.id) || undefined : undefined;

    const user = new User({
      id,
      name,
      email,
      password,
      profilePicture: props.profilePicture,
      blocked: props.blocked,
      pending: props.pending
    });

    // Add domain event if it's a new user (optional check for id could be refined)
    if (!props.id) {
      user.addDomainEvent(new UserRegisteredEvent(user));
    }

    return user;
  }

  // Getters - Return primitive types for convenience
  get id(): string | undefined {
    return this._id?.getValue();
  }

  get firstName(): string {
    return this._name.getFirstName();
  }

  get lastName(): string {
    return this._name.getLastName();
  }

  get fullName(): string {
    return this._name.getFullName();
  }

  get email(): string {
    return this._email.getValue();
  }

  get password(): string {
    return this._password.getValue();
  }

  get profilePicture(): string | undefined {
    return this._profilePicture;
  }

  get blocked(): boolean {
    return this._blocked;
  }

  get pending(): boolean {
    return this._pending;
  }

  // Getters for value objects (when needed)
  get emailObject(): Email {
    return this._email;
  }

  get nameObject(): PersonName {
    return this._name;
  }

  // Domain methods
  updateEmail(newEmail: string): void {
    this._email = Email.create(newEmail);
  }

  changePassword(newPassword: string): void {
    this._password = Password.create(newPassword);
    this.addDomainEvent(new PasswordChangedEvent(this));
  }

  updateProfilePicture(url: string): void {
    this._profilePicture = url;
  }

  block(): void {
    this._blocked = true;
  }

  unblock(): void {
    this._blocked = false;
  }

  confirm(): void {
    this._pending = false;
  }

  isBlocked(): boolean {
    return this._blocked;
  }

  isPending(): boolean {
    return this._pending;
  }
}

/**
 * Faculty Entity - Domain Model
 * Represents a faculty member with proper encapsulation and value objects
 */
export class Faculty {
  private _id?: UserId;
  private _fullName: string;
  private _email: Email;
  private _phone: PhoneNumber;
  private _department: string;
  private _qualification: string;
  private _experience: string;
  private _aboutMe: string;
  private _cvUrl?: string;
  private _certificatesUrl?: string[];

  private constructor(props: {
    id?: UserId;
    fullName: string;
    email: Email;
    phone: PhoneNumber;
    department: string;
    qualification: string;
    experience: string;
    aboutMe: string;
    cvUrl?: string;
    certificatesUrl?: string[];
  }) {
    this._id = props.id;
    this._fullName = props.fullName;
    this._email = props.email;
    this._phone = props.phone;
    this._department = props.department;
    this._qualification = props.qualification;
    this._experience = props.experience;
    this._aboutMe = props.aboutMe;
    this._cvUrl = props.cvUrl;
    this._certificatesUrl = props.certificatesUrl;
  }

  /**
   * Create a new Faculty entity
   * Accepts primitive strings and creates value objects internally
   */
  static create(props: FacultyProps): Faculty {
    // Validate required fields
    if (!props.fullName?.trim()) {
      throw new ValidationError('Full name is required');
    }
    if (!props.email) {
      throw new ValidationError('Email is required');
    }
    if (!props.phone) {
      throw new ValidationError('Phone is required');
    }
    if (!props.department?.trim()) {
      throw new ValidationError('Department is required');
    }
    if (!props.qualification?.trim()) {
      throw new ValidationError('Qualification is required');
    }
    if (!props.experience?.trim()) {
      throw new ValidationError('Experience is required');
    }
    if (!props.aboutMe?.trim()) {
      throw new ValidationError('About me is required');
    }

    // Create value objects
    const email = Email.create(props.email);
    const phone = PhoneNumber.create(props.phone);
    const id = props.id ? UserId.createOrNull(props.id) || undefined : undefined;

    return new Faculty({
      id,
      fullName: props.fullName.trim(),
      email,
      phone,
      department: props.department.trim(),
      qualification: props.qualification.trim(),
      experience: props.experience.trim(),
      aboutMe: props.aboutMe.trim(),
      cvUrl: props.cvUrl,
      certificatesUrl: props.certificatesUrl
    });
  }

  // Getters
  get id(): string | undefined {
    return this._id?.getValue();
  }

  get fullName(): string {
    return this._fullName;
  }

  get email(): string {
    return this._email.getValue();
  }

  get phone(): string {
    return this._phone.getValue();
  }

  get department(): string {
    return this._department;
  }

  get qualification(): string {
    return this._qualification;
  }

  get experience(): string {
    return this._experience;
  }

  get aboutMe(): string {
    return this._aboutMe;
  }

  get cvUrl(): string | undefined {
    return this._cvUrl;
  }

  get certificatesUrl(): string[] | undefined {
    return this._certificatesUrl;
  }

  // Getters for value objects
  get emailObject(): Email {
    return this._email;
  }

  get phoneObject(): PhoneNumber {
    return this._phone;
  }

  // Domain methods
  updateEmail(newEmail: string): void {
    this._email = Email.create(newEmail);
  }

  updatePhone(newPhone: string): void {
    this._phone = PhoneNumber.create(newPhone);
  }

  updateCv(cvUrl: string): void {
    this._cvUrl = cvUrl;
  }

  addCertificate(certificateUrl: string): void {
    if (!this._certificatesUrl) {
      this._certificatesUrl = [];
    }
    this._certificatesUrl.push(certificateUrl);
  }
}