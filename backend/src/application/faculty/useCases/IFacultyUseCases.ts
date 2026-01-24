import {
    GetFacultyRequestDTO,
    GetFacultyByIdRequestDTO,
    GetFacultyByTokenRequestDTO,
    ApproveFacultyRequestDTO,
    RejectFacultyRequestDTO,
    DeleteFacultyRequestDTO,
    ConfirmFacultyOfferRequestDTO,
    DownloadCertificateRequestDTO,
} from "../dtos/FacultyRequestDTOs";
import {
    GetFacultyResponseDTO,
    GetFacultyByIdResponseDTO,
    GetFacultyByTokenResponseDTO,
    ApproveFacultyResponseDTO,
    RejectFacultyResponseDTO,
    DeleteFacultyResponseDTO,
    ConfirmFacultyOfferResponseDTO,
    DownloadCertificateResponseDTO,
    FacultyResponseDTO,
} from "../dtos/FacultyResponseDTOs";

export interface ResponseDTO<T> {
    data: T | { error: string };
    success: boolean;
}


export interface IGetFacultyUseCase {
    execute(params: GetFacultyRequestDTO): Promise<ResponseDTO<GetFacultyResponseDTO>>;
}

export interface IGetFacultyByIdUseCase {
    execute(params: GetFacultyByIdRequestDTO): Promise<ResponseDTO<GetFacultyByIdResponseDTO>>;
}

export interface IGetFacultyByTokenUseCase {
    execute(params: GetFacultyByTokenRequestDTO): Promise<ResponseDTO<GetFacultyByTokenResponseDTO>>;
}

export interface IApproveFacultyUseCase {
    execute(params: ApproveFacultyRequestDTO): Promise<ResponseDTO<ApproveFacultyResponseDTO>>;
}

export interface IRejectFacultyUseCase {
    execute(params: RejectFacultyRequestDTO): Promise<ResponseDTO<RejectFacultyResponseDTO>>;
}

export interface IDeleteFacultyUseCase {
    execute(params: DeleteFacultyRequestDTO): Promise<ResponseDTO<DeleteFacultyResponseDTO>>;
}

export interface IConfirmFacultyOfferUseCase {
    execute(params: ConfirmFacultyOfferRequestDTO): Promise<ResponseDTO<ConfirmFacultyOfferResponseDTO>>;
}

export interface IDownloadCertificateUseCase {
    execute(params: DownloadCertificateRequestDTO): Promise<ResponseDTO<DownloadCertificateResponseDTO>>;
}

export interface IBlockFacultyUseCase {
    execute(params: { id: string }): Promise<ResponseDTO<{ message: string }>>;
}

export interface IServeDocumentUseCase {
    execute(params: { facultyId: string, documentUrl: string, type: string, requestingUserId: string }): Promise<ResponseDTO<{ pdfData: string, fileName: string, contentType: string }>>;
}