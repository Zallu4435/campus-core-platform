import {
  GetSportRequestsRequestDTO,
  ApproveSportRequestRequestDTO,
  RejectSportRequestRequestDTO,
  GetSportRequestDetailsRequestDTO,
  JoinSportRequestDTO
} from "../dtos/SportRequestDTOs";
import {
  GetSportRequestsResponseDTO,
  GetSportRequestDetailsResponseDTO
} from "../dtos/SportResponseDTOs";
import { ISportsRepository } from "../repositories/ISportsRepository";
import { SportRequestStatus } from "../../../domain/sports/entities/SportTypes";
import {
  IGetSportRequestsUseCase,
  IApproveSportRequestUseCase,
  IRejectSportRequestUseCase,
  IGetSportRequestDetailsUseCase,
  IJoinSportUseCase
} from "./ISportRequestUseCases";

function isValidObjectId(id: string): boolean {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

export class GetSportRequestsUseCase implements IGetSportRequestsUseCase {
  constructor(private _sportsRepository: ISportsRepository) { }

  async execute(params: GetSportRequestsRequestDTO): Promise<GetSportRequestsResponseDTO> {
    if (isNaN(params.page) || params.page < 1 || isNaN(params.limit) || params.limit < 1) {
      throw new Error("Invalid page or limit parameters");
    }
    return await this._sportsRepository.getSportRequests(params);
  }
}

export class ApproveSportRequestUseCase implements IApproveSportRequestUseCase {
  constructor(private _sportsRepository: ISportsRepository) { }

  async execute(params: ApproveSportRequestRequestDTO): Promise<{ message: string }> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid sport request ID");
    }

    const response = await this._sportsRepository.getSportRequestDetails({ id: params.id });
    if (!response || !response.request) {
      throw new Error("Sport request not found");
    }

    const { request } = response;

    if (request.status !== SportRequestStatus.Pending) {
      throw new Error(`Sport request is already ${request.status}`);
    }

    // Atomically update request status
    await this._sportsRepository.updateSportRequestStatus(params.id, SportRequestStatus.Approved);

    // Increment participants
    if (request.sportId) {
      await this._sportsRepository.incrementSportParticipants(request.sportId);
    }

    // Trigger notification
    if (request.userId) {
      const sportTitle = request.sportTitle || 'a sport';
      await this._sportsRepository.sendRequestApprovalNotification('sport', params.id, request.userId, sportTitle);
    }

    return { message: "Sport request approved successfully" };
  }
}

export class RejectSportRequestUseCase implements IRejectSportRequestUseCase {
  constructor(private _sportsRepository: ISportsRepository) { }

  async execute(params: RejectSportRequestRequestDTO): Promise<{ message: string }> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid sport request ID");
    }

    const response = await this._sportsRepository.getSportRequestDetails({ id: params.id });
    if (!response || !response.request) {
      throw new Error("Sport request not found");
    }

    const { request } = response;

    if (request.status !== SportRequestStatus.Pending) {
      throw new Error(`Sport request is already ${request.status}`);
    }

    // Atomically update request status
    await this._sportsRepository.updateSportRequestStatus(params.id, SportRequestStatus.Rejected);

    // Trigger notification
    if (request.userId) {
      const sportTitle = request.sportTitle || 'a sport';
      await this._sportsRepository.sendRequestRejectionNotification('sport', params.id, request.userId, sportTitle);
    }

    return { message: "Sport request rejected successfully" };
  }
}

export class GetSportRequestDetailsUseCase implements IGetSportRequestDetailsUseCase {
  constructor(private _sportsRepository: ISportsRepository) { }

  async execute(params: GetSportRequestDetailsRequestDTO): Promise<GetSportRequestDetailsResponseDTO> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid sport request ID");
    }
    const response = await this._sportsRepository.getSportRequestDetails(params);
    if (!response || !response.request) {
      throw new Error("Sport request not found");
    }
    return response;
  }
}

export class JoinSportUseCase implements IJoinSportUseCase {
  constructor(private _sportsRepository: ISportsRepository) { }

  async execute(params: JoinSportRequestDTO): Promise<{ message: string }> {
    if (!isValidObjectId(params.sportId)) {
      throw new Error("Invalid sport ID");
    }
    if (!isValidObjectId(params.userId)) {
      throw new Error("Invalid user ID");
    }

    await this._sportsRepository.createSportRequest({
      sportId: params.sportId,
      userId: params.userId,
      whyJoin: params.whyJoin,
      additionalInfo: params.additionalInfo || "",
      status: SportRequestStatus.Pending
    });

    return { message: "Join request submitted successfully" };
  }
}