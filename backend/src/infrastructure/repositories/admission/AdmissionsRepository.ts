import { v4 as uuidv4 } from "uuid";
import { AdmissionErrorType } from "../../../domain/admission/enums/AdmissionErrorType";
import { IAdmissionsRepository } from "../../../application/admission/repositories/IAdmissionsRepository";
import { AdmissionDraft as AdmissionDraftModel } from "../../database/mongoose/admission/AdmissionDraftModel";
import { Admission as AdmissionModel } from "../../database/mongoose/admission/AdmissionModel";
import { PaymentModel } from "../../database/mongoose/financial/financial.model";
import { DocumentUploadService } from '../../services/admission/DocumentUploadService';
import { IPaymentService } from "../../../application/admission/services/IPaymentService";
import { PaymentService } from "../../services/financial/PaymentService";
import {
    CreateApplicationResponseDTO,
    ProcessPaymentResponseDTO,
    ConfirmPaymentResponseDTO,
    UploadDocumentResponseDTO,
    UploadMultipleDocumentsResponseDTO,
} from "../../../application/admission/dtos/AdmissionResponseDTOs";
import { Admission, AdmissionDraft } from "../../../domain/admission/entities/Admission";
import { AdmissionMapper } from "./AdmissionMapper";
import { IAdmissionDraftSource, IAdmissionSource } from "./infraTypes";
import { IFile } from "../../../domain/shared/types/FileTypes";

export class AdmissionsRepository implements IAdmissionsRepository {

    private _documentUploadService: DocumentUploadService;
    private _paymentService: IPaymentService;

    constructor() {
        this._documentUploadService = new DocumentUploadService();
        this._paymentService = new PaymentService();
    }

    async createApplication(params: { userId: string }): Promise<CreateApplicationResponseDTO> {
        let draft = await AdmissionDraftModel.findOne({ registerId: params.userId });
        if (draft) {
            return { applicationId: draft.applicationId };
        }

        const applicationId = uuidv4();
        draft = new AdmissionDraftModel({
            applicationId,
            registerId: params.userId,
            personal: {},
            choiceOfStudy: [],
            education: {},
            achievements: {},
            otherInformation: {},
            documents: {},
            declaration: {},
            completedSteps: [],
        });
        await draft.save();

        return { applicationId: draft.applicationId };
    }

    async findDraftByRegisterId(userId: string): Promise<AdmissionDraft | null> {
        const doc = await AdmissionDraftModel.findOne({ registerId: userId }).lean();
        if (!doc) return null;
        return AdmissionMapper.toDraftDomain(doc as unknown as IAdmissionDraftSource);
    }

    async findDraftByApplicationId(applicationId: string): Promise<AdmissionDraft | null> {
        const doc = await AdmissionDraftModel.findOne({ applicationId }).lean();
        if (!doc) return null;
        return AdmissionMapper.toDraftDomain(doc as unknown as IAdmissionDraftSource);
    }

    async saveDraft(draft: AdmissionDraft): Promise<void> {
        // Map Domain Entity back to Mongoose update
        // Since AdmissionDraft manages its own state, we can extract properties
        // However, standard Mongoose 'save' works on Mongoose Documents.
        // We need to update the document based on the Entity fields.
        await AdmissionDraftModel.updateOne(
            { applicationId: draft.getApplicationId() },
            {
                $set: {
                    personal: draft.getPersonal(),
                    choiceOfStudy: draft.getChoiceOfStudy(),
                    education: draft.getEducation(),
                    achievements: draft.getAchievements(),
                    otherInformation: draft.getOtherInformation(),
                    documents: draft.getDocuments(),
                    declaration: draft.getDeclaration(),
                    completedSteps: draft.getCompletedSteps(),
                    updatedAt: new Date()
                }
            }
        );
    }

    async processPayment(params: { applicationId: string, paymentDetails: { method: string, amount: number, currency: string, paymentMethodId?: string, returnUrl?: string } }): Promise<ProcessPaymentResponseDTO> {
        const { applicationId, paymentDetails } = params;
        const draft = await AdmissionDraftModel.findOne({ applicationId });
        if (!draft) throw new Error(AdmissionErrorType.ApplicationNotFound);

        const payment = new PaymentModel({
            studentId: draft.registerId,
            date: new Date(),
            description: "Admission Application Fee",
            method: paymentDetails.method,
            amount: paymentDetails.amount,
            status: "Pending",
            metadata: {
                currency: paymentDetails.currency,
                paymentMethodId: paymentDetails.paymentMethodId,
                applicationId: applicationId,
            }
        });
        await payment.save();

        const paymentIntent = await this._paymentService.createPaymentIntent(
            paymentDetails.amount,
            paymentDetails.currency,
            paymentDetails.paymentMethodId,
            {
                paymentId: payment._id.toString(),
                applicationId: applicationId,
                studentId: draft.registerId.toString(),
            }
        );

        payment.metadata = {
            ...payment.metadata,
            stripePaymentIntentId: paymentIntent.id,
            returnUrl: paymentDetails.returnUrl,
            clientSecret: paymentIntent.client_secret,
        };
        await payment.save();

        return {
            paymentId: payment._id.toString(),
            status: "pending",
            message: "Payment created successfully. Please complete the payment.",
            clientSecret: paymentIntent.client_secret || undefined,
            stripePaymentIntentId: paymentIntent.id,
        };
    }

    async confirmPayment(params: { paymentId: string, stripePaymentIntentId: string }): Promise<ConfirmPaymentResponseDTO> {
        const { paymentId, stripePaymentIntentId } = params;
        const payment = await PaymentModel.findById(paymentId);
        if (!payment) throw new Error(AdmissionErrorType.PaymentNotFound);

        const confirmationResult = await this._paymentService.confirmPayment(stripePaymentIntentId, payment.metadata?.paymentMethodId as string);
        const stripeStatus = confirmationResult.status;
        const paymentStatus = this.mapStripeStatusToPaymentStatus(stripeStatus);

        payment.status = paymentStatus === "completed" ? "Completed" :
            paymentStatus === "pending" ? "Pending" : "Failed";

        payment.metadata = {
            ...payment.metadata,
            stripeStatus: stripeStatus,
            confirmedAt: new Date(),
            lastChecked: new Date(),
        };

        await payment.save();

        return {
            paymentId: payment._id.toString(),
            status: paymentStatus,
            message: this.getPaymentMessage(stripeStatus),
            stripePaymentIntentId: stripePaymentIntentId,
        };
    }

    async finalizeAdmission(params: { applicationId: string, paymentId: string }): Promise<{ admission: Admission }> {
        const draft = await AdmissionDraftModel.findOne({ applicationId: params.applicationId });
        if (!draft) throw new Error(AdmissionErrorType.ApplicationNotFound);

        const payment = await PaymentModel.findById(params.paymentId);
        if (!payment) throw new Error(AdmissionErrorType.PaymentNotFound);

        if (!payment.studentId.equals(draft.registerId)) {
            throw new Error(AdmissionErrorType.PaymentMismatch);
        }

        if (payment.status !== "Completed") {
            payment.status = "Completed";
            await payment.save();
        }

        const newAdmission = new AdmissionModel({
            applicationId: draft.applicationId,
            registerId: draft.registerId,
            personal: draft.personal,
            choiceOfStudy: draft.choiceOfStudy,
            education: draft.education,
            achievements: draft.achievements,
            otherInformation: draft.otherInformation,
            documents: draft.documents,
            declaration: draft.declaration,
            paymentId: payment._id,
            status: "pending",
            rejectedBy: null,
            confirmationToken: null,
            tokenExpiry: null,
        });

        await newAdmission.save();
        await AdmissionDraftModel.deleteOne({ applicationId: params.applicationId });

        return {
            admission: AdmissionMapper.toAdmissionDomain(newAdmission.toObject() as unknown as IAdmissionSource),
        };
    }

    private mapStripeStatusToPaymentStatus(stripeStatus: string | null): string {
        switch (stripeStatus) {
            case "succeeded":
                return "completed";
            case "processing":
                return "pending";
            default:
                return "failed";
        }
    }

    private getPaymentMessage(status: string | null): string {
        switch (status) {
            case "succeeded":
                return "Payment processed successfully";
            case "requires_payment_method":
                return "Additional payment method required";
            case "requires_confirmation":
            case "requires_action":
                return "Additional verification required";
            case "processing":
                return "Payment is processing";
            default:
                return "Payment failed";
        }
    }

    async uploadDocument(params: { file: IFile, applicationId: string, documentType: string }): Promise<UploadDocumentResponseDTO> {
        const uploadResult = await this._documentUploadService.uploadDocument(params.file as unknown as Express.Multer.File, params.applicationId, params.documentType);
        return {
            success: true,
            message: 'Document uploaded successfully',
            document: {
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                fileName: uploadResult.fileName,
                fileType: uploadResult.fileType,
            }
        };
    }

    async uploadMultipleDocuments(params: { files: IFile[], applicationId: string, documentTypes: string[] }): Promise<UploadMultipleDocumentsResponseDTO> {
        const uploadResults = await this._documentUploadService.uploadMultipleDocuments(params.files as unknown as Express.Multer.File[], params.applicationId, params.documentTypes);
        return {
            success: true,
            message: 'Documents uploaded successfully',
            documents: uploadResults.map(result => ({
                url: result.url,
                publicId: result.publicId,
                fileName: result.fileName,
                fileType: result.fileType,
            }))
        };
    }

    async getDocumentByKey(params: { userId: string; documentKey: string }): Promise<{ url?: string; fileName?: string; fileType?: string;[key: string]: unknown } | null> {
        const draft = await AdmissionDraftModel.findOne({ registerId: params.userId }).lean();
        if (!draft || !draft.documents) {
            return null;
        }
        const docsArray = Array.isArray(draft.documents.documents)
            ? draft.documents.documents as Array<Record<string, unknown>>
            : [];
        const found = docsArray.find((doc) => doc.id === params.documentKey) as { url?: string; cloudinaryUrl?: string;[key: string]: unknown } | undefined;
        if (!found) return null;

        return {
            ...found,
            url: (found.url || found.cloudinaryUrl) as string | undefined
        };
    }
}