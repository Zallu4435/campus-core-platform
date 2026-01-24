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

export interface IGetEventRequestsUseCase {
  execute(params: GetEventRequestsRequestDTO): Promise<GetEventRequestsResponseDTO>;
}

export interface IApproveEventRequestUseCase {
  execute(params: ApproveEventRequestRequestDTO): Promise<{ message: string }>;
}

export interface IRejectEventRequestUseCase {
  execute(params: RejectEventRequestRequestDTO): Promise<{ message: string }>;
}

export interface IGetEventRequestDetailsUseCase {
  execute(params: GetEventRequestDetailsRequestDTO): Promise<GetEventRequestDetailsResponseDTO>;
}
