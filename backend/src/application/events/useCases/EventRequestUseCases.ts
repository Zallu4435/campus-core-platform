import {
  GetEventRequestsRequestDTO,
  ApproveEventRequestRequestDTO,
  RejectEventRequestRequestDTO,
  GetEventRequestDetailsRequestDTO
} from "../dtos/EventRequestDTOs";
import {
  GetEventRequestsResponseDTO,
  GetEventRequestDetailsResponseDTO
} from "../dtos/EventResponseDTOs";
import { IEventsRepository } from "../repositories/IEventsRepository";
import { EventRequestStatus } from "../../../domain/events/entities/EventTypes";
import {
  IGetEventRequestsUseCase,
  IApproveEventRequestUseCase,
  IRejectEventRequestUseCase,
  IGetEventRequestDetailsUseCase
} from "./IEventRequestUseCases";

function isValidObjectId(id: string): boolean {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

export class GetEventRequestsUseCase implements IGetEventRequestsUseCase {
  constructor(private _eventsRepository: IEventsRepository) { }

  async execute(params: GetEventRequestsRequestDTO): Promise<GetEventRequestsResponseDTO> {
    if (isNaN(params.page) || params.page < 1 || isNaN(params.limit) || params.limit < 1) {
      throw new Error("Invalid page or limit parameters");
    }
    return await this._eventsRepository.getEventRequests(params);
  }
}

export class ApproveEventRequestUseCase implements IApproveEventRequestUseCase {
  constructor(private _eventsRepository: IEventsRepository) { }

  async execute(params: ApproveEventRequestRequestDTO): Promise<{ message: string }> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid event request ID");
    }

    const response = await this._eventsRepository.getEventRequestDetails({ id: params.id });
    if (!response || !response.eventRequest) {
      throw new Error("Event request not found");
    }

    const { eventRequest } = response;

    if (eventRequest.status !== EventRequestStatus.Pending) {
      throw new Error(`Event request is already ${eventRequest.status}`);
    }

    // Atomically update request status
    await this._eventsRepository.updateEventRequestStatus(params.id, EventRequestStatus.Approved);

    // Increment participants
    if (eventRequest.eventId) {
      await this._eventsRepository.incrementEventParticipants(eventRequest.eventId);
    }

    // Trigger notification
    if (eventRequest.userId) {
      const eventTitle = eventRequest.eventName || 'an event';
      await this._eventsRepository.sendRequestApprovalNotification('event', params.id, eventRequest.userId, eventTitle);
    }

    return { message: "Event request approved successfully" };
  }
}

export class RejectEventRequestUseCase implements IRejectEventRequestUseCase {
  constructor(private _eventsRepository: IEventsRepository) { }

  async execute(params: RejectEventRequestRequestDTO): Promise<{ message: string }> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid event request ID");
    }

    const response = await this._eventsRepository.getEventRequestDetails({ id: params.id });
    if (!response || !response.eventRequest) {
      throw new Error("Event request not found");
    }

    const { eventRequest } = response;

    if (eventRequest.status !== EventRequestStatus.Pending) {
      throw new Error(`Event request is already ${eventRequest.status}`);
    }

    // Atomically update request status
    await this._eventsRepository.updateEventRequestStatus(params.id, EventRequestStatus.Rejected);

    // Trigger notification
    if (eventRequest.userId) {
      const eventTitle = eventRequest.eventName || 'an event';
      await this._eventsRepository.sendRequestRejectionNotification('event', params.id, eventRequest.userId, eventTitle);
    }

    return { message: "Event request rejected successfully" };
  }
}

export class GetEventRequestDetailsUseCase implements IGetEventRequestDetailsUseCase {
  constructor(private _eventsRepository: IEventsRepository) { }

  async execute(params: GetEventRequestDetailsRequestDTO): Promise<GetEventRequestDetailsResponseDTO> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid event request ID");
    }
    const response = await this._eventsRepository.getEventRequestDetails(params);
    if (!response || !response.eventRequest) {
      throw new Error("Event request not found");
    }
    return response;
  }
}