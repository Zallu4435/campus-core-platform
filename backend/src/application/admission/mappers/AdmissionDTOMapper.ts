import { AdmissionDraft, Admission } from "../../../domain/admission/entities/Admission";
import { IAdmissionDraft, IAdmission } from "../../../domain/admission/entities/AdmissionTypes";

export class AdmissionDTOMapper {
    static toDraftDTO(draft: AdmissionDraft): IAdmissionDraft {
        return {
            id: draft.id,
            applicationId: draft.getApplicationId(),
            registerId: draft.getRegisterId(),
            personal: draft.getPersonal(),
            choiceOfStudy: draft.getChoiceOfStudy(),
            education: draft.getEducation(),
            achievements: draft.getAchievements(),
            otherInformation: draft.getOtherInformation(),
            documents: draft.getDocuments(),
            declaration: draft.getDeclaration(),
            completedSteps: draft.getCompletedSteps(),
            createdAt: draft.getCreatedAt(),
            updatedAt: draft.getUpdatedAt(),
        };
    }

    static toAdmissionDTO(admission: Admission): IAdmission {
        return {
            id: admission.id,
            applicationId: admission.getApplicationId(),
            registerId: admission.getRegisterId(),
            personal: admission.getPersonal(),
            choiceOfStudy: admission.getChoiceOfStudy(),
            education: admission.getEducation(),
            achievements: admission.getAchievements(),
            otherInformation: admission.getOtherInformation(),
            documents: admission.getDocuments(),
            declaration: admission.getDeclaration(),
            completedSteps: admission.getCompletedSteps(),
            createdAt: admission.getCreatedAt(),
            updatedAt: admission.getUpdatedAt(),
            paymentId: admission.getPaymentId(),
            status: admission.getStatus(),
            rejectedBy: admission.getRejectedBy(),
            confirmationToken: admission.getConfirmationToken(),
            tokenExpiry: admission.getTokenExpiry(),
        };
    }
}
