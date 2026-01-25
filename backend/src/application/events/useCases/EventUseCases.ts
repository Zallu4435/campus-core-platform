import { GetEventsRequestDTO, GetEventByIdRequestDTO, CreateEventRequestDTO, UpdateEventRequestDTO, DeleteEventRequestDTO } from "../dtos/EventRequestDTOs";
import { GetEventsResponseDTO, GetEventByIdResponseDTO, CreateEventResponseDTO, UpdateEventResponseDTO } from "../dtos/EventResponseDTOs";
import { RepositoryEventData } from "../dtos/EventBaseDTOs";
import { IEventsRepository } from "../repositories/IEventsRepository";
import { Event } from "../../../domain/events/entities/Event";
import { OrganizerType, EventType, Timeframe, EventStatus, EventProps } from "../../../domain/events/entities/EventTypes";
import {
  IGetEventsUseCase,
  IGetEventByIdUseCase,
  ICreateEventUseCase,
  IUpdateEventUseCase,
  IDeleteEventUseCase
} from "./IEventUseCases";

function isValidObjectId(id: string): boolean {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

export class GetEventsUseCase implements IGetEventsUseCase {
  constructor(private _eventsRepository: IEventsRepository) { }

  async execute(params: GetEventsRequestDTO): Promise<GetEventsResponseDTO> {
    if (isNaN(params.page) || params.page < 1 || isNaN(params.limit) || params.limit < 1) {
      throw new Error("Invalid page or limit parameters");
    }
    return await this._eventsRepository.getEvents(params);
  }
}

export class GetEventByIdUseCase implements IGetEventByIdUseCase {
  constructor(private _eventsRepository: IEventsRepository) { }

  async execute(params: GetEventByIdRequestDTO): Promise<GetEventByIdResponseDTO> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid event ID");
    }
    const event = await this._eventsRepository.getById(params.id);
    if (!event) {
      throw new Error("Event not found!");
    }

    const eventData: RepositoryEventData = {
      ...event,
      id: event.id
    };

    return { event: eventData };
  }
}

export class CreateEventUseCase implements ICreateEventUseCase {
  constructor(private _eventsRepository: IEventsRepository) { }

  async execute(params: CreateEventRequestDTO): Promise<CreateEventResponseDTO> {
    // Basic validation before domain creation
    const eventProps: EventProps = {
      title: params.title,
      organizer: params.organizer,
      organizerType: params.organizerType as OrganizerType,
      eventType: params.eventType as EventType,
      date: params.date,
      time: params.time,
      location: params.location,
      timeframe: params.timeframe as Timeframe,
      status: params.status as EventStatus || EventStatus.Upcoming,
      icon: params.icon,
      color: params.color,
      description: params.description,
      fullTime: params.fullTime,
      additionalInfo: params.additionalInfo,
      requirements: params.requirements,
      maxParticipants: params.maxParticipants,
      registrationRequired: params.registrationRequired,
      participants: params.participants
    };

    Event.create(eventProps);

    const newEvent = await this._eventsRepository.create(params);

    return {
      event: {
        ...newEvent,
        id: newEvent.id
      }
    };
  }
}

export class UpdateEventUseCase implements IUpdateEventUseCase {
  constructor(private _eventsRepository: IEventsRepository) { }

  async execute(params: UpdateEventRequestDTO): Promise<UpdateEventResponseDTO> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid event ID");
    }

    const { id, ...updateData } = params;
    const updatedEvent = await this._eventsRepository.updateById(id, updateData);

    if (!updatedEvent) {
      throw new Error("Event not found!");
    }

    return {
      event: {
        ...updatedEvent,
        id: updatedEvent.id
      }
    };
  }
}

export class DeleteEventUseCase implements IDeleteEventUseCase {
  constructor(private _eventsRepository: IEventsRepository) { }

  async execute(params: DeleteEventRequestDTO): Promise<{ message: string }> {
    if (!isValidObjectId(params.id)) {
      throw new Error("Invalid event ID");
    }

    await this._eventsRepository.deleteById(params.id);
    return { message: "Event deleted successfully" };
  }
}