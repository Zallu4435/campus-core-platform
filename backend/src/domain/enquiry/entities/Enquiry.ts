import { EnquiryStatus, EnquiryProps, CreateEnquiryProps } from "./EnquiryTypes";
import { EnquiryValidationError } from "../errors/EnquiryErrors";

export type { EnquiryProps };

export class Enquiry {
  constructor(public props: EnquiryProps) { }

  // Getters
  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get email() { return this.props.email; }
  get subject() { return this.props.subject; }
  get message() { return this.props.message; }
  get status() { return this.props.status; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  static create(props: CreateEnquiryProps): Enquiry {
    if (!props.name || props.name.trim().length === 0) throw new EnquiryValidationError("name", "Name is required");
    if (!props.email || props.email.trim().length === 0) throw new EnquiryValidationError("email", "Email is required");
    if (!props.subject || props.subject.trim().length === 0) throw new EnquiryValidationError("subject", "Subject is required");
    if (!props.message || props.message.trim().length === 0) throw new EnquiryValidationError("message", "Message is required");

    const now = new Date();
    return new Enquiry({
      ...props,
      id: undefined,
      status: props.status || EnquiryStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  static update(existingProps: EnquiryProps, updateData: Partial<EnquiryProps>): Enquiry {
    const updatedProps: EnquiryProps = {
      ...existingProps,
      ...updateData,
      id: existingProps.id,
      createdAt: existingProps.createdAt,
      updatedAt: new Date(),
    };

    return new Enquiry(updatedProps);
  }

  updateStatus(status: EnquiryStatus): Enquiry {
    return new Enquiry({
      ...this.props,
      status,
      updatedAt: new Date(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}