import {
  GetEventsRequestDTO,
  CreateEventRequestDTO,
  GetEventRequestsRequestDTO,
  GetEventRequestDetailsRequestDTO,
} from "../dtos/EventRequestDTOs";
import {
  GetEventsResponseDTO,
  GetEventRequestsResponseDTO,
  GetEventRequestDetailsResponseDTO
} from "../dtos/EventResponseDTOs";
import { EventDataDTO } from "../dtos/EventBaseDTOs";
import { IBaseRepository } from "../../repositories/IBaseRepository";
import { Event, EventRequestStatus } from "../../../domain/events/entities/EventTypes";

export interface IEventsRepository extends
  IBaseRepository<Event, CreateEventRequestDTO, Partial<EventDataDTO>, Record<string, unknown>, Event> {

  getEvents(params: GetEventsRequestDTO): Promise<GetEventsResponseDTO>;
  getEventRequests(params: GetEventRequestsRequestDTO): Promise<GetEventRequestsResponseDTO>;
  updateEventRequestStatus(id: string, status: EventRequestStatus): Promise<void>;
  incrementEventParticipants(eventId: string): Promise<void>;
  getEventRequestDetails(params: GetEventRequestDetailsRequestDTO): Promise<GetEventRequestDetailsResponseDTO>;
}