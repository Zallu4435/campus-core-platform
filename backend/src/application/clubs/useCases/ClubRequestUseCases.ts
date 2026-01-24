import {
  GetClubRequestsRequestDTO,
  ApproveClubRequestRequestDTO,
  RejectClubRequestRequestDTO,
  GetClubRequestDetailsRequestDTO,
} from "../dtos/ClubRequestDTOs";
import {
  GetClubRequestsResponseDTO,
  GetClubRequestDetailsResponseDTO,
} from "../dtos/ClubResponseDTOs";
import { IClubsRepository } from "../repositories/IClubsRepository";
import {
  IGetClubRequestsUseCase,
  IApproveClubRequestUseCase,
  IGetClubRequestDetailsUseCase,
  IRejectClubRequestUseCase
} from "./IClubRequestUseCases";
import { ClubRequestStatus } from "../../../domain/clubs/entities/ClubTypes";

export class GetClubRequestsUseCase implements IGetClubRequestsUseCase {
  constructor(private _clubsRepository: IClubsRepository) { }

  async execute(params: GetClubRequestsRequestDTO): Promise<GetClubRequestsResponseDTO> {
    if (isNaN(params.page) || params.page < 1 || isNaN(params.limit) || params.limit < 1) {
      throw new Error("Invalid page or limit parameters");
    }
    return await this._clubsRepository.getClubRequests(params);
  }
}

export class ApproveClubRequestUseCase implements IApproveClubRequestUseCase {
  constructor(private _clubsRepository: IClubsRepository) { }

  async execute(params: ApproveClubRequestRequestDTO): Promise<{ message: string }> {
    if (!params.id || params.id.trim() === "") {
      throw new Error("Invalid club request ID");
    }

    // 1. Get detailed request information
    const response = await this._clubsRepository.getClubRequestDetails({ id: params.id });
    if (!response || !response.request) {
      throw new Error("Club request not found");
    }

    const { request } = response;

    // 2. Validate current status
    if (request.status !== ClubRequestStatus.Pending) {
      throw new Error(`Club request is already ${request.status}`);
    }

    // 3. Atomically update request status
    await this._clubsRepository.updateClubRequestStatus(params.id, ClubRequestStatus.Approved);

    // 4. Increment club members
    if (request.clubId) {
      await this._clubsRepository.incrementClubMembers(request.clubId);
    }

    // 5. Trigger notification (Side effect orchestrated by Use Case)
    if (request.userId) {
      const clubTitle = request.clubName || 'a club';
      await this._clubsRepository.sendRequestApprovalNotification('club', params.id, request.userId, clubTitle);
    }

    return { message: "Club request approved successfully" };
  }
}

export class RejectClubRequestUseCase implements IRejectClubRequestUseCase {
  constructor(private _clubsRepository: IClubsRepository) { }

  async execute(params: RejectClubRequestRequestDTO): Promise<{ message: string }> {
    if (!params.id || params.id.trim() === "") {
      throw new Error("Invalid club request ID");
    }

    // 1. Get detailed request information
    const response = await this._clubsRepository.getClubRequestDetails({ id: params.id });
    if (!response || !response.request) {
      throw new Error("Club request not found");
    }

    const { request } = response;

    // 2. Validate current status
    if (request.status !== ClubRequestStatus.Pending) {
      throw new Error(`Club request is already ${request.status}`);
    }

    // 3. Atomically update request status
    await this._clubsRepository.updateClubRequestStatus(params.id, ClubRequestStatus.Rejected);

    // 4. Trigger notification (Side effect orchestrated by Use Case)
    if (request.userId) {
      const clubTitle = request.clubName || 'a club';
      await this._clubsRepository.sendRequestRejectionNotification('club', params.id, request.userId, clubTitle);
    }

    return { message: "Club request rejected successfully" };
  }
}

export class GetClubRequestDetailsUseCase implements IGetClubRequestDetailsUseCase {
  constructor(private _clubsRepository: IClubsRepository) { }

  async execute(params: GetClubRequestDetailsRequestDTO): Promise<GetClubRequestDetailsResponseDTO> {
    if (!params.id || params.id.trim() === "") {
      throw new Error("Invalid club request ID");
    }
    const response = await this._clubsRepository.getClubRequestDetails(params);
    if (!response || !response.request) {
      throw new Error("Club request not found");
    }
    return response;
  }
}