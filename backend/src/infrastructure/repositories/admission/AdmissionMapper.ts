import { Admission, AdmissionDraft } from "../../../domain/admission/entities/Admission";
import { AdmissionStatus, RejectedBy } from "../../../domain/admission/entities/AdmissionTypes";
import { IAdmissionDraftSource, IAdmissionSource } from "./infraTypes";

export class AdmissionMapper {
    static toDraftDomain(doc: IAdmissionDraftSource): AdmissionDraft {
        return new AdmissionDraft({
            id: doc._id.toString(),
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
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date()
        });
    }

    static toAdmissionDomain(doc: IAdmissionSource): Admission {
        return new Admission({
            id: doc._id.toString(),
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
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
            paymentId: doc.paymentId?.toString(),
            status: doc.status as AdmissionStatus,
            rejectedBy: doc.rejectedBy as RejectedBy,
            confirmationToken: doc.confirmationToken,
            tokenExpiry: doc.tokenExpiry
        });
    }
}
