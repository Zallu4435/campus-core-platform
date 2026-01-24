import { IEventsRepository } from "../../../application/events/repositories/IEventsRepository";
import {
  GetEventRequestsUseCase,
  ApproveEventRequestUseCase,
  RejectEventRequestUseCase,
  GetEventRequestDetailsUseCase,
} from "../../../application/events/useCases/EventRequestUseCases";
import {
  IGetEventRequestsUseCase,
  IApproveEventRequestUseCase,
  IRejectEventRequestUseCase,
  IGetEventRequestDetailsUseCase
} from "../../../application/events/useCases/IEventRequestUseCases";
import { EventRequestController } from "../../../presentation/http/events/EventRequestController";
import { EventsRepository } from "../../repositories/events/EventsRepository";
import { IEventRequestController } from "../../../presentation/http/IHttp";

export function getEventRequestsComposer(): IEventRequestController {
  const repository: IEventsRepository = new EventsRepository();
  const getEventRequestsUseCase: IGetEventRequestsUseCase = new GetEventRequestsUseCase(repository);
  const approveEventRequestUseCase: IApproveEventRequestUseCase = new ApproveEventRequestUseCase(repository);
  const rejectEventRequestUseCase: IRejectEventRequestUseCase = new RejectEventRequestUseCase(repository);
  const getEventRequestDetailsUseCase: IGetEventRequestDetailsUseCase = new GetEventRequestDetailsUseCase(repository);

  return new EventRequestController(
    getEventRequestsUseCase,
    approveEventRequestUseCase,
    rejectEventRequestUseCase,
    getEventRequestDetailsUseCase
  );
} 