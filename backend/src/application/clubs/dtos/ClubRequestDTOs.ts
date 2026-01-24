import { ClubDataDTO, ClubRequestDataDTO } from "./ClubBaseDTOs";


export interface GetClubsRequestDTO {
    page: number;
    limit: number;
    category?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

export interface GetClubByIdRequestDTO {
    id: string;
}

export interface CreateClubRequestDTO extends ClubDataDTO { }

export type UpdateClubRequestDTO = {
    id: string;
} & Partial<ClubDataDTO>;

export interface DeleteClubRequestDTO {
    id: string;
}

export interface GetClubRequestsRequestDTO {
    page: number;
    limit: number;
    status: string;
    type: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface ApproveClubRequestRequestDTO {
    id: string;
}

export interface RejectClubRequestRequestDTO {
    id: string;
}

export interface GetClubRequestDetailsRequestDTO {
    id: string;
}

export interface JoinClubRequestDTO extends ClubRequestDataDTO { }
