import { Types } from "mongoose";
import { Student } from "../../../../domain/academics/entities/Student";
import { Course } from "../../../../domain/academics/entities/Course";
import { Enrollment } from "../../../../domain/academics/entities/Enrollment";
import { Grade } from "../../../../domain/academics/entities/Grade";
import { AcademicHistory } from "../../../../domain/academics/entities/AcademicHistory";
import { Program } from "../../../../domain/academics/entities/Program";
import { Progress } from "../../../../domain/academics/entities/Progress";
import { Requirement } from "../../../../domain/academics/entities/Requirement";
import { TranscriptRequest } from "../../../../domain/academics/entities/TranscriptRequest";
import { EnrollmentStatus } from "../../../../domain/academics/enums/AcademicEnums";
import { AcademicConstants } from "../../../../application/academics/constants/AcademicConstants";

// Source Interfaces (mirroring Mongoose Documents as loosely as needed for mapping)
import {
    IStudentSource,
    ICourseSource,
    IEnrollmentSource,
    IGradeSource,
    IAcademicHistorySource,
    IProgramSource,
    IProgressSource,
    IRequirementSource,
    ITranscriptRequestSource
} from "../infraTypes";

export class AcademicMappers {
    static toStudent(userDoc: IStudentSource, programDoc?: any): Student {
        const id = userDoc._id.toString();
        return new Student(
            id,
            userDoc.firstName,
            userDoc.lastName,
            userDoc.email,
            userDoc.phone || "",
            userDoc.profilePicture
        );
    }

    static toCourse(doc: ICourseSource): Course {
        return new Course(
            doc._id.toString(),
            doc.title,
            doc.specialization,
            doc.faculty,
            doc.credits,
            doc.term || AcademicConstants.Grade.UNKNOWN_TERM,
            doc.maxEnrollment,
            doc.currentEnrollment || 0,
            doc.createdAt ? new Date(doc.createdAt) : new Date(),
            doc.schedule,
            doc.description || "",
            doc.prerequisites
        );
    }

    static toEnrollment(doc: IEnrollmentSource): Enrollment {
        // Map status string to Enum
        const statusStr = doc.status;
        let status = EnrollmentStatus.Pending;
        if (Object.values(EnrollmentStatus).includes(statusStr as EnrollmentStatus)) {
            status = statusStr as EnrollmentStatus;
        }

        const courseIdVal = doc.courseId
            ? ((typeof doc.courseId === 'object' && '_id' in doc.courseId)
                ? (doc.courseId as { _id: Types.ObjectId | string })._id.toString()
                : doc.courseId.toString())
            : "";

        return new Enrollment(
            doc._id.toString(),
            doc.studentId.toString(),
            courseIdVal,
            status,
            doc.requestedAt ? new Date(doc.requestedAt) : new Date(),
            doc.reason
        );
    }

    static toGrade(doc: IGradeSource): Grade {
        return new Grade(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.cumulativeGPA.toString(),
            doc.termGPA.toString(),
            doc.termName,
            doc.creditsEarned.toString(),
            doc.creditsInProgress.toString()
        );
    }

    static toAcademicHistory(doc: IAcademicHistorySource): AcademicHistory {
        return new AcademicHistory(
            doc._id.toString(),
            doc.studentId ? doc.studentId.toString() : '',
            doc.term,
            doc.credits.toString(),
            doc.gpa.toString()
        );
    }

    static toProgram(doc: IProgramSource): Program {
        return new Program(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.degree,
            doc.catalogYear,
            doc.credits
        );
    }

    static toProgress(doc: IProgressSource): Progress {
        return new Progress(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.overallProgress,
            doc.totalCredits,
            doc.completedCredits,
            doc.remainingCredits,
            doc.estimatedGraduation
        );
    }

    static toRequirement(doc: IRequirementSource): Requirement {
        return new Requirement(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.core,
            doc.elective,
            doc.general
        );
    }

    static toTranscriptRequest(doc: ITranscriptRequestSource): TranscriptRequest {
        return new TranscriptRequest(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.deliveryMethod,
            doc.requestedAt ? new Date(doc.requestedAt) : new Date(),
            doc.estimatedDelivery ? new Date(doc.estimatedDelivery) : new Date(),
            doc.requestId,
            doc.address,
            doc.email
        );
    }
}
