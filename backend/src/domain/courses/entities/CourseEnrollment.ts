import { CourseErrorType } from "../enums/CourseErrorType";
import { EnrollmentProps, EnrollmentStatus } from "../types";

export class Enrollment {
  private idValue?: string;
  private studentIdValue: string | { _id: string; email: string; name?: string };
  private courseIdValue: string | { _id: string; title: string; specialization?: string };
  private statusValue: EnrollmentStatus;
  private requestedAtValue: Date;
  private reasonValue: string;

  constructor(props: EnrollmentProps) {
    this.idValue = props.id;
    this.studentIdValue = props.studentId;
    this.courseIdValue = props.courseId;
    this.statusValue = props.status;
    this.requestedAtValue = props.requestedAt || new Date();
    this.reasonValue = props.reason || "";
  }

  static create(props: EnrollmentProps): Enrollment {
    if (!props.studentId) {
      throw new Error(CourseErrorType.InvalidStudentId);
    }
    if (!props.courseId) {
      throw new Error(CourseErrorType.InvalidCourseId);
    }
    return new Enrollment(props);
  }

  get id(): string | undefined { return this.idValue; }
  get studentId(): string | { _id: string; email: string; name?: string } { return this.studentIdValue; }
  get courseId(): string | { _id: string; title: string; specialization?: string } { return this.courseIdValue; }
  get status(): EnrollmentStatus { return this.statusValue; }
  get requestedAt(): Date { return this.requestedAtValue; }
  get reason(): string { return this.reasonValue; }

  // Helper methods to get the actual ID values
  get studentIdString(): string {
    return typeof this.studentIdValue === 'string' ? this.studentIdValue : this.studentIdValue._id;
  }

  get courseIdString(): string {
    return typeof this.courseIdValue === 'string' ? this.courseIdValue : this.courseIdValue._id;
  }

  // Helper methods to get display values
  get studentEmail(): string {
    return typeof this.studentIdValue === 'string' ? 'Unknown User' : this.studentIdValue.email;
  }

  get courseTitle(): string {
    return typeof this.courseIdValue === 'string' ? 'Unknown Course' : this.courseIdValue.title;
  }
}