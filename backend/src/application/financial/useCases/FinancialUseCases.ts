import { FinancialErrorType } from "../../../domain/financial/enums/FinancialErrorType";
import {
    GetStudentFinancialInfoRequestDTO,
    GetAllPaymentsRequestDTO,
    GetOnePaymentRequestDTO,
    MakePaymentRequestDTO,
    UploadDocumentRequestDTO,
    GetPaymentReceiptRequestDTO,
    CreateChargeRequestDTO,
    GetAllChargesRequestDTO,
    UpdateChargeRequestDTO,
    DeleteChargeRequestDTO,
} from "../dtos/FinancialRequestDTOs";
import {
    GetStudentFinancialInfoResponseDTO,
    GetAllPaymentsResponseDTO,
    GetOnePaymentResponseDTO,
    MakePaymentResponseDTO,
    UploadDocumentResponseDTO,
    GetPaymentReceiptResponseDTO,
    CreateChargeResponseDTO,
    GetAllChargesResponseDTO,
    UpdateChargeResponseDTO,
    DeleteChargeResponseDTO,
} from "../dtos/FinancialResponseDTOs";
import { IFinancialRepository } from "../repositories/IFinancialRepository";
import { CreateChargeParams, UploadDocumentParams, PaymentFilter, ChargeFilter } from "../../../domain/financial/types/FinancialTypes";
import { Charge } from "../../../domain/financial/entities/FinancialEntities";
import {
    IGetStudentFinancialInfoUseCase,
    IGetAllPaymentsUseCase,
    IGetOnePaymentUseCase,
    IMakePaymentUseCase,
    IUploadDocumentUseCase,
    IGetPaymentReceiptUseCase,
    ICreateChargeUseCase,
    IGetAllChargesUseCase,
    IUpdateChargeUseCase,
    IDeleteChargeUseCase,
    ICheckPendingPaymentUseCase,
    IClearPendingPaymentUseCase
} from "./IFinancialUseCases";
import { FinancialValidationError, FinancialNotFoundError } from "../../../domain/financial/errors/FinancialErrors";

export class GetStudentFinancialInfoUseCase implements IGetStudentFinancialInfoUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: GetStudentFinancialInfoRequestDTO): Promise<GetStudentFinancialInfoResponseDTO> {
        if (!params.studentId) {
            throw new FinancialValidationError(FinancialErrorType.InvalidStudentId);
        }
        const result = await this._financialRepository.getStudentFinancialInfo(params.studentId);
        return result;
    }
}

export class GetAllPaymentsUseCase implements IGetAllPaymentsUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: GetAllPaymentsRequestDTO): Promise<GetAllPaymentsResponseDTO> {
        const filter: PaymentFilter = {
            startDate: params.startDate ? new Date(params.startDate) : undefined,
            endDate: params.endDate ? new Date(params.endDate) : undefined,
            status: params.status,
            studentId: params.studentId
        };
        const result = await this._financialRepository.getAllPayments(filter, params.page, params.limit);
        return result;
    }
}

export class GetOnePaymentUseCase implements IGetOnePaymentUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: GetOnePaymentRequestDTO): Promise<GetOnePaymentResponseDTO> {
        if (!params.paymentId) {
            throw new FinancialValidationError(FinancialErrorType.InvalidPaymentId);
        }
        const result = await this._financialRepository.getOnePayment(params.paymentId);
        if (!result) throw new FinancialNotFoundError(FinancialErrorType.PaymentNotFound);
        return result;
    }
}

export class MakePaymentUseCase implements IMakePaymentUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: MakePaymentRequestDTO): Promise<MakePaymentResponseDTO> {
        if (!params.studentId) {
            throw new FinancialValidationError(FinancialErrorType.InvalidStudentId);
        }
        if (params.amount <= 0) {
            throw new FinancialValidationError(FinancialErrorType.InvalidAmount);
        }
        const result = await this._financialRepository.makePayment(params.studentId, params.chargeId, params.amount, params.term, params.method, params.razorpayPaymentId, params.razorpayOrderId, params.razorpaySignature);
        return result;
    }
}

export class UploadDocumentUseCase implements IUploadDocumentUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: UploadDocumentRequestDTO): Promise<UploadDocumentResponseDTO> {
        if (!params.file) {
            throw new FinancialValidationError(FinancialErrorType.FileRequired);
        }
        const repoParams: UploadDocumentParams = { file: params.file, type: params.type };
        const result = await this._financialRepository.uploadDocument(repoParams);
        return result;
    }
}

export class GetPaymentReceiptUseCase implements IGetPaymentReceiptUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: GetPaymentReceiptRequestDTO): Promise<GetPaymentReceiptResponseDTO> {
        if (!params.studentId || !params.paymentId) {
            throw new FinancialValidationError(FinancialErrorType.InvalidId);
        }
        const result = await this._financialRepository.getPaymentReceipt(params.paymentId);
        if (!result) throw new FinancialNotFoundError(FinancialErrorType.ReceiptNotFound);
        return result;
    }
}

export class CreateChargeUseCase implements ICreateChargeUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: CreateChargeRequestDTO): Promise<CreateChargeResponseDTO> {
        if (params.amount <= 0) {
            throw new FinancialValidationError(FinancialErrorType.InvalidAmount);
        }
        if (!params.title || !params.description || !params.term || !params.applicableFor) {
            throw new FinancialValidationError(FinancialErrorType.MissingRequiredFields);
        }
        const repoParams: CreateChargeParams = {
            title: params.title,
            description: params.description,
            amount: params.amount,
            term: params.term,
            dueDate: new Date(params.dueDate),
            applicableFor: params.applicableFor,
            createdBy: params.createdBy,
        };
        const result = await this._financialRepository.createCharge(repoParams);
        return result;
    }
}

export class UpdateChargeUseCase implements IUpdateChargeUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: UpdateChargeRequestDTO): Promise<UpdateChargeResponseDTO> {
        if (!params.id) {
            throw new FinancialValidationError(FinancialErrorType.InvalidChargeId);
        }
        if (params.data.amount && params.data.amount <= 0) {
            throw new FinancialValidationError(FinancialErrorType.InvalidAmount);
        }

        const updateData = params.data;

        let parsedApplicableFor: Record<string, unknown> | undefined;
        if (updateData.applicableFor !== undefined) {
            if (typeof updateData.applicableFor === 'string') {
                try {
                    parsedApplicableFor = JSON.parse(updateData.applicableFor);
                } catch {
                    parsedApplicableFor = { type: updateData.applicableFor };
                }
            } else {
                parsedApplicableFor = updateData.applicableFor as Record<string, unknown>;
            }
        }

        const updateFields: Partial<Charge> = {
            title: updateData.title,
            description: updateData.description,
            amount: updateData.amount,
            term: updateData.term,
            applicableFor: parsedApplicableFor,
            status: updateData.status,
            dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined
        };

        // Remove undefined keys to avoid overwriting with undefined
        Object.keys(updateFields).forEach(key => {
            if (updateFields[key as keyof Partial<Charge>] === undefined) {
                delete updateFields[key as keyof Partial<Charge>];
            }
        });

        const result = await this._financialRepository.updateCharge(params.id, updateFields);
        if (!result) throw new FinancialNotFoundError(FinancialErrorType.InvalidChargeId);
        return result;
    }
}

export class DeleteChargeUseCase implements IDeleteChargeUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: DeleteChargeRequestDTO): Promise<DeleteChargeResponseDTO> {
        if (!params.id) {
            throw new FinancialValidationError(FinancialErrorType.InvalidChargeId);
        }
        const result = await this._financialRepository.deleteCharge(params.id);
        return result;
    }
}

export class GetAllChargesUseCase implements IGetAllChargesUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(params: GetAllChargesRequestDTO): Promise<GetAllChargesResponseDTO> {
        const filter: ChargeFilter = {
            term: params.term === 'All Terms' ? undefined : params.term,
            status: params.status === 'All Statuses' ? undefined : params.status,
            searchQuery: params.search
        };
        const result = await this._financialRepository.getAllCharges(filter, params.page, params.limit);
        return result;
    }
}

export class CheckPendingPaymentUseCase implements ICheckPendingPaymentUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }
    async execute(studentId: string): Promise<{ hasPending: boolean }> {
        if (!studentId) {
            throw new FinancialValidationError(FinancialErrorType.InvalidStudentId);
        }
        const hasPending = await this._financialRepository.hasPendingPayment(studentId);
        return { hasPending };
    }
}

export class ClearPendingPaymentUseCase implements IClearPendingPaymentUseCase {
    constructor(private _financialRepository: IFinancialRepository) { }

    async execute(studentId: string): Promise<{ success: boolean }> {
        if (!studentId) {
            throw new FinancialValidationError(FinancialErrorType.InvalidStudentId);
        }
        const result = await this._financialRepository.clearPendingPayment(studentId);
        return { success: result };
    }
}
