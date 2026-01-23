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
import { CreateChargeParams, UploadDocumentParams } from "../../../domain/financial/entities/FinancialTypes";
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
        const result = await this._financialRepository.getAllPayments(params.startDate, params.endDate, params.status, params.studentId, params.page, params.limit);
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
        if (params.data.amount <= 0) {
            throw new FinancialValidationError(FinancialErrorType.InvalidAmount);
        }
        if (!params.data.title || !params.data.description || !params.data.term || !params.data.applicableFor) {
            throw new FinancialValidationError(FinancialErrorType.MissingRequiredFields);
        }
        const updateFields: Record<string, unknown> = { ...params.data as unknown as Record<string, unknown> };
        if (updateFields.dueDate) {
            updateFields.dueDate = new Date(updateFields.dueDate as string);
        }
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
        const result = await this._financialRepository.getAllCharges(params.term, params.status, params.search, params.page, params.limit);
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
