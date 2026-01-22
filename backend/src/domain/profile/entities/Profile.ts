// src/domain/profile/entities/Profile.ts
import { AggregateRoot } from "../../shared/AggregateRoot";
import { ProfileRole } from "./ProfileTypes";
import { ValidationError } from "../errors/ProfileErrors";

export interface ProfileProps {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    role: ProfileRole;
    passwordChangedAt?: Date;
    password?: string;
    updatedAt?: Date;
}

export class Profile extends AggregateRoot {
    private _id: string;
    private _firstName: string;
    private _lastName?: string;
    private _email: string;
    private _phone?: string;
    private _profilePicture?: string;
    private _role: ProfileRole;
    private _passwordChangedAt?: Date;
    private _password?: string;
    private _updatedAt?: Date;

    private constructor(props: ProfileProps) {
        super();
        this._id = props.id;
        this._firstName = props.firstName;
        this._lastName = props.lastName;
        this._email = props.email;
        this._phone = props.phone;
        this._profilePicture = props.profilePicture;
        this._role = props.role;
        this._passwordChangedAt = props.passwordChangedAt;
        this._password = props.password;
        this._updatedAt = props.updatedAt;
    }

    public static create(props: ProfileProps): Profile {
        if (!props.firstName) throw new ValidationError("First Name is required");
        if (!props.email) throw new ValidationError("Email is required");

        return new Profile(props);
    }

    // Getters
    get id(): string { return this._id; }
    get firstName(): string { return this._firstName; }
    get lastName(): string | undefined { return this._lastName; }
    get email(): string { return this._email; }
    get phone(): string | undefined { return this._phone; }
    get profilePicture(): string | undefined { return this._profilePicture; }
    get role(): ProfileRole { return this._role; }
    get passwordChangedAt(): Date | undefined { return this._passwordChangedAt; }
    get password(): string | undefined { return this._password; }
    get updatedAt(): Date | undefined { return this._updatedAt; }

    // Domain Behaviors
    updatePersonalDetails(firstName: string, lastName?: string, phone?: string, email?: string): void {
        if (!firstName) throw new ValidationError("First Name cannot be empty");
        if (!email) throw new ValidationError("Email cannot be empty");

        this._firstName = firstName;
        this._lastName = lastName;
        this._phone = phone;
        this._email = email;
        this._updatedAt = new Date();
    }

    updateProfilePicture(url: string): void {
        if (!url) throw new ValidationError("Profile picture URL required");
        this._profilePicture = url;
        this._updatedAt = new Date();
    }

    changePassword(hashedPassword: string): void {
        this._password = hashedPassword;
        this._passwordChangedAt = new Date();
        this._updatedAt = new Date();
    }
}
