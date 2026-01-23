import {
  GetInboxMessagesRequestDTO,
  GetSentMessagesRequestDTO,
  SendMessageRequestDTO,
  MarkMessageAsReadRequestDTO,
  DeleteMessageRequestDTO,
  GetMessageDetailsRequestDTO,
  GetAllAdminsRequestDTO,
  FetchUsersRequestDTO,
} from "../dtos/CommunicationRequestDTOs";
import {
  GetInboxMessagesResponseDTO,
  GetSentMessagesResponseDTO,
  SendMessageResponseDTO,
  MarkMessageAsReadResponseDTO,
  DeleteMessageResponseDTO,
  GetMessageDetailsResponseDTO,
  AdminSentMessageResponseDTO,
  GetAllAdminsResponseDTO,
  FetchUsersResponseDTO
} from "../dtos/CommunicationResponseDTOs";

export interface IGetInboxMessagesUseCase {
  execute(params: GetInboxMessagesRequestDTO): Promise<GetInboxMessagesResponseDTO>;
}

export interface IGetSentMessagesUseCase {
  execute(params: GetSentMessagesRequestDTO): Promise<GetSentMessagesResponseDTO>;
}

export interface ISendMessageUseCase {
  execute(params: SendMessageRequestDTO): Promise<SendMessageResponseDTO>;
}

export interface IMarkMessageAsReadUseCase {
  execute(params: MarkMessageAsReadRequestDTO): Promise<MarkMessageAsReadResponseDTO>;
}

export interface IDeleteMessageUseCase {
  execute(params: DeleteMessageRequestDTO): Promise<DeleteMessageResponseDTO>;
}

export interface IGetMessageDetailsUseCase {
  execute(params: GetMessageDetailsRequestDTO): Promise<GetMessageDetailsResponseDTO>;
}

export interface IGetAllAdminsUseCase {
  execute(params: GetAllAdminsRequestDTO): Promise<GetAllAdminsResponseDTO>;
}

export interface IFetchUsersUseCase {
  execute(params: FetchUsersRequestDTO): Promise<FetchUsersResponseDTO>;
}
