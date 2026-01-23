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

export interface IGetStudentFinancialInfoUseCase {
    execute(params: GetStudentFinancialInfoRequestDTO): Promise<GetStudentFinancialInfoResponseDTO>;
}

export interface IGetAllPaymentsUseCase {
    execute(params: GetAllPaymentsRequestDTO): Promise<GetAllPaymentsResponseDTO>;
}

export interface IGetOnePaymentUseCase {
    execute(params: GetOnePaymentRequestDTO): Promise<GetOnePaymentResponseDTO>;
}

export interface IMakePaymentUseCase {
    execute(params: MakePaymentRequestDTO): Promise<MakePaymentResponseDTO>;
}

export interface IUploadDocumentUseCase {
    execute(params: UploadDocumentRequestDTO): Promise<UploadDocumentResponseDTO>;
}

export interface IGetPaymentReceiptUseCase {
    execute(params: GetPaymentReceiptRequestDTO): Promise<GetPaymentReceiptResponseDTO>;
}

export interface ICreateChargeUseCase {
    execute(params: CreateChargeRequestDTO): Promise<CreateChargeResponseDTO>;
}

export interface IGetAllChargesUseCase {
    execute(params: GetAllChargesRequestDTO): Promise<GetAllChargesResponseDTO>;
}

export interface IUpdateChargeUseCase {
    execute(params: UpdateChargeRequestDTO): Promise<UpdateChargeResponseDTO>;
}

export interface IDeleteChargeUseCase {
    execute(params: DeleteChargeRequestDTO): Promise<DeleteChargeResponseDTO>;
}

export interface ICheckPendingPaymentUseCase {
    execute(studentId: string): Promise<{ hasPending: boolean }>;
}

export interface IClearPendingPaymentUseCase {
    execute(studentId: string): Promise<{ success: boolean }>;
}
