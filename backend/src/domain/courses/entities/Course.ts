import { CourseErrorType } from "../enums/CourseErrorType";
import { CourseProps } from "../types/CourseTypes";

export class Course {
  private readonly props: CourseProps;

  constructor(props: CourseProps) {
    this.props = {
      ...props,
      currentEnrollment: props.currentEnrollment || 0,
      description: props.description || "",
      term: props.term || "",
      prerequisites: props.prerequisites || []
    };
  }

  static create(props: CourseProps): Course {
    if (!props.title || props.title.length < 3) {
      throw new Error(CourseErrorType.InvalidCourseTitle);
    }
    if (!props.specialization) {
      throw new Error(CourseErrorType.InvalidSpecialization);
    }
    if (!props.faculty) {
      throw new Error(CourseErrorType.InvalidFaculty);
    }
    if (!props.credits || props.credits < 0) {
      throw new Error(CourseErrorType.InvalidCredits);
    }
    if (!props.maxEnrollment || props.maxEnrollment < 1) {
      throw new Error(CourseErrorType.InvalidCredits); // Could create a specific error
    }
    return new Course(props);
  }

  get id(): string | undefined { return this.props.id; }
  get title(): string { return this.props.title; }
  get specialization(): string { return this.props.specialization; }
  get faculty(): string { return this.props.faculty; }
  get credits(): number { return this.props.credits; }
  get schedule(): string { return this.props.schedule; }
  get maxEnrollment(): number { return this.props.maxEnrollment; }
  get currentEnrollment(): number { return this.props.currentEnrollment; }
  get description(): string { return this.props.description; }
  get term(): string { return this.props.term; }
  get prerequisites(): string[] { return this.props.prerequisites; }
}