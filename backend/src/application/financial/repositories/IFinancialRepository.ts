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
import { CreateChargeParams, UploadDocumentParams, ChargeFilter, PaymentFilter } from "../../../domain/financial/types/FinancialTypes";
import { Charge } from "../../../domain/financial/entities/FinancialEntities";

export interface IFinancialRepository {
    getStudentFinancialInfo(studentId: string): Promise<GetStudentFinancialInfoResponseDTO>;
    getAllPayments(filter: PaymentFilter, page: number, limit: number): Promise<GetAllPaymentsResponseDTO>;
    getOnePayment(paymentId: string): Promise<GetOnePaymentResponseDTO>;
    makePayment(studentId: string, chargeId: string, amount: number, term: string, method: string, razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string): Promise<MakePaymentResponseDTO>;
    uploadDocument(params: UploadDocumentParams): Promise<UploadDocumentResponseDTO>;
    getPaymentReceipt(paymentId: string): Promise<GetPaymentReceiptResponseDTO>;
    createCharge(params: CreateChargeParams): Promise<CreateChargeResponseDTO>;
    getAllCharges(filter: ChargeFilter, page: number, limit: number): Promise<GetAllChargesResponseDTO>;
    updateCharge(chargeId: string, updateFields: Partial<Charge>): Promise<UpdateChargeResponseDTO>;
    deleteCharge(chargeId: string): Promise<DeleteChargeResponseDTO>;
    hasPendingPayment(studentId: string): Promise<boolean>;
    clearPendingPayment(studentId: string): Promise<boolean>;
}