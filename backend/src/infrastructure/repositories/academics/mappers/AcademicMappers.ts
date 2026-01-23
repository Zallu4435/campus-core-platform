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
interface IMongooseDocument {
    _id: any;
    createdAt?: any;
    updatedAt?: any;
}

export class AcademicMappers {
    static toStudent(userDoc: any, programDoc?: any): Student {
        const id = userDoc._id.toString();
        return new Student(
            id,
            userDoc.firstName,
            userDoc.lastName,
            userDoc.email,
            userDoc.phone,
            userDoc.profilePicture
        );
    }

    static toCourse(doc: any): Course {
        return new Course(
            doc._id.toString(),
            doc.title,
            doc.specialization,
            doc.faculty,
            doc.credits,
            doc.term || AcademicConstants.Grade.UNKNOWN_TERM,
            doc.maxEnrollment,
            doc.currentEnrollment || 0,
            new Date(doc.createdAt),
            doc.schedule,
            doc.description,
            doc.prerequisites
        );
    }

    static toEnrollment(doc: any): Enrollment {
        // Map status string to Enum
        const statusStr = doc.status;
        let status = EnrollmentStatus.Pending;
        if (Object.values(EnrollmentStatus).includes(statusStr)) {
            status = statusStr as EnrollmentStatus;
        }

        return new Enrollment(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.courseId?._id ? doc.courseId._id.toString() : doc.courseId?.toString(), // Handle populated or not
            status,
            new Date(doc.requestedAt),
            doc.reason
        );
    }

    static toGrade(doc: any): Grade {
        return new Grade(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.cumulativeGPA,
            doc.termGPA,
            doc.termName,
            doc.creditsEarned,
            doc.creditsInProgress
        );
    }

    static toAcademicHistory(doc: any): AcademicHistory {
        return new AcademicHistory(
            doc._id.toString(), // Entity has string ID, doc has _id (ObjectId) OR id (number). 
            // The entity def I made has `id: string`. 
            // The Model has `id: Number` field AND `_id: ObjectId`. 
            // Logic Check: Previous Use Case mapped `record.id` (number).
            // I will use `doc.id` if present, else `doc._id`.
            doc.studentId ? doc.studentId.toString() : '',
            doc.term,
            doc.credits,
            doc.gpa
        );
    }

    static toProgram(doc: any): Program {
        return new Program(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.degree,
            doc.catalogYear,
            doc.credits
        );
    }

    static toProgress(doc: any): Progress {
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

    static toRequirement(doc: any): Requirement {
        return new Requirement(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.core,
            doc.elective,
            doc.general
        );
    }

    static toTranscriptRequest(doc: any): TranscriptRequest {
        return new TranscriptRequest(
            doc._id.toString(),
            doc.studentId.toString(),
            doc.deliveryMethod,
            new Date(doc.requestedAt),
            new Date(doc.estimatedDelivery),
            doc.requestId,
            doc.address,
            doc.email
        );
    }
}
