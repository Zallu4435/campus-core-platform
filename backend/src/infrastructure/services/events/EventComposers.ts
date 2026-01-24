import { IEventsRepository } from "../../../application/events/repositories/IEventsRepository";
import {
  GetEventsUseCase,
  GetEventByIdUseCase,
  CreateEventUseCase,
  UpdateEventUseCase,
  DeleteEventUseCase
} from "../../../application/events/useCases/EventUseCases";
import {
  IGetEventsUseCase,
  IGetEventByIdUseCase,
  ICreateEventUseCase,
  IUpdateEventUseCase,
  IDeleteEventUseCase
} from "../../../application/events/useCases/IEventUseCases";
import { EventController } from "../../../presentation/http/events/EventController";
import { EventsRepository } from "../../repositories/events/EventsRepository";
import { IEventController } from "../../../presentation/http/IHttp";

export function getEventsComposer(): IEventController {
  const repository: IEventsRepository = new EventsRepository();
  const getEventsUseCase: IGetEventsUseCase = new GetEventsUseCase(repository);
  const getEventByIdUseCase: IGetEventByIdUseCase = new GetEventByIdUseCase(repository);
  const createEventUseCase: ICreateEventUseCase = new CreateEventUseCase(repository);
  const updateEventUseCase: IUpdateEventUseCase = new UpdateEventUseCase(repository);
  const deleteEventUseCase: IDeleteEventUseCase = new DeleteEventUseCase(repository);

  return new EventController(
    getEventsUseCase,
    getEventByIdUseCase,
    createEventUseCase,
    updateEventUseCase,
    deleteEventUseCase
  );
} 