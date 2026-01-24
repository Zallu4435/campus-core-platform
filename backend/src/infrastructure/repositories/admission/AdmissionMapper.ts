import { Admission, AdmissionDraft } from "../../../domain/admission/entities/Admission";
import { AdmissionStatus, RejectedBy } from "../../../domain/admission/entities/AdmissionTypes";

export class AdmissionMapper {
    static toDraftDomain(doc: any): AdmissionDraft {
        return new AdmissionDraft({
            id: doc._id?.toString() || doc.id,
            applicationId: doc.applicationId,
            registerId: doc.registerId,
            personal: doc.personal,
            choiceOfStudy: doc.choiceOfStudy,
            education: doc.education,
            achievements: doc.achievements,
            otherInformation: doc.otherInformation,
            documents: doc.documents,
            declaration: doc.declaration,
            completedSteps: doc.completedSteps,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    static toAdmissionDomain(doc: any): Admission {
        return new Admission({
            id: doc._id?.toString() || doc.id,
            applicationId: doc.applicationId,
            registerId: doc.registerId,
            personal: doc.personal,
            choiceOfStudy: doc.choiceOfStudy,
            education: doc.education,
            achievements: doc.achievements,
            otherInformation: doc.otherInformation,
            documents: doc.documents,
            declaration: doc.declaration,
            completedSteps: doc.completedSteps,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            paymentId: doc.paymentId?.toString(),
            status: doc.status as AdmissionStatus,
            rejectedBy: doc.rejectedBy as RejectedBy,
            confirmationToken: doc.confirmationToken,
            tokenExpiry: doc.tokenExpiry
        });
    }
}
