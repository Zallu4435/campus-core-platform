import {
    GetAdmissionsRequestDTO,
    GetAdmissionByIdRequestDTO,
    GetAdmissionByTokenRequestDTO,
    ApproveAdmissionRequestDTO,
    RejectAdmissionRequestDTO,
    DeleteAdmissionRequestDTO,
    ConfirmAdmissionOfferRequestDTO,
} from "../dtos/AdmissionRequestDTOs";
import {
    GetAdmissionsResponseDTO,
    GetAdmissionByIdResponseDTO,
    GetAdmissionByTokenResponseDTO,
    ApproveAdmissionResponseDTO,
    RejectAdmissionResponseDTO,
    DeleteAdmissionResponseDTO,
    ConfirmAdmissionOfferResponseDTO,
} from "../dtos/AdmissionResponseDTOs";
import { ServeAdmissionDocumentRequestDTO, ServeAdmissionDocumentResponseDTO } from "./ServeAdmissionDocumentUseCase";

export interface IGetAdmissionsUseCase {
    execute(params: GetAdmissionsRequestDTO): Promise<GetAdmissionsResponseDTO>;
}

export interface IGetAdmissionByIdUseCase {
    execute(params: GetAdmissionByIdRequestDTO): Promise<GetAdmissionByIdResponseDTO>;
}

export interface IGetAdmissionByTokenUseCase {
    execute(params: GetAdmissionByTokenRequestDTO): Promise<GetAdmissionByTokenResponseDTO>;
}

export interface IApproveAdmissionUseCase {
    execute(params: ApproveAdmissionRequestDTO): Promise<ApproveAdmissionResponseDTO>;
}

export interface IRejectAdmissionUseCase {
    execute(params: RejectAdmissionRequestDTO): Promise<RejectAdmissionResponseDTO>;
}

export interface IDeleteAdmissionUseCase {
    execute(params: DeleteAdmissionRequestDTO): Promise<DeleteAdmissionResponseDTO>;
}

export interface IConfirmAdmissionOfferUseCase {
    execute(params: ConfirmAdmissionOfferRequestDTO): Promise<ConfirmAdmissionOfferResponseDTO>;
}

export interface IBlockAdmissionUseCase {
    execute(params: { id: string }): Promise<{ message: string }>;
}

export interface IServeAdmissionDocumentUseCase {
    execute(params: ServeAdmissionDocumentRequestDTO): Promise<ServeAdmissionDocumentResponseDTO>;
}
