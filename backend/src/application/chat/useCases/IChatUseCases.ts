import { Message } from "../../../domain/chat/entities/Message";
import {
  GetChatsRequestDTO,
  SearchChatsRequestDTO,
  GetChatMessagesRequestDTO,
  SendMessageRequestDTO,
  MarkMessagesAsReadRequestDTO,
  AddReactionRequestDTO,
  RemoveReactionRequestDTO,
  SearchUsersRequestDTO,
  CreateChatRequestDTO,
  CreateGroupChatRequestDTO,
  AddGroupMemberRequestDTO,
  RemoveGroupMemberRequestDTO,
  UpdateGroupAdminRequestDTO,
  UpdateGroupSettingsRequestDTO,
  UpdateGroupInfoRequestDTO,
  LeaveGroupRequestDTO,
  EditMessageRequestDTO,
  DeleteMessageRequestDTO,
  ReplyToMessageRequestDTO,
  DeleteChatRequestDTO,
  BlockChatRequestDTO,
  ClearChatRequestDTO
} from "../dtos/ChatRequestDTOs";
import {
  GetChatsResponseDTO,
  GetChatMessagesResponseDTO,
  ChatDetailsResponseDTO,
  SearchUsersResponseDTO,
  ChatSummaryDTO,
} from "../dtos/ChatResponseDTOs";

export interface IGetChatsUseCase {
  execute(params: GetChatsRequestDTO): Promise<GetChatsResponseDTO>;
}

export interface ISearchChatsUseCase {
  execute(params: SearchChatsRequestDTO): Promise<GetChatsResponseDTO>;
}

export interface IGetChatMessagesUseCase {
  execute(params: GetChatMessagesRequestDTO): Promise<GetChatMessagesResponseDTO>;
}

export interface IGetChatDetailsUseCase {
  execute(chatId: string, userId: string): Promise<ChatDetailsResponseDTO | null>;
}

export interface IMarkMessagesAsReadUseCase {
  execute(params: MarkMessagesAsReadRequestDTO): Promise<void>;
}

export interface ISendMessageUseCase {
  execute(params: SendMessageRequestDTO): Promise<void>;
}

export interface IAddReactionUseCase {
  execute(params: AddReactionRequestDTO): Promise<void>;
}

export interface IRemoveReactionUseCase {
  execute(params: RemoveReactionRequestDTO): Promise<void>;
}

export interface ISearchUsersUseCase {
  execute(params: SearchUsersRequestDTO): Promise<SearchUsersResponseDTO>;
}

export interface ICreateChatUseCase {
  execute(params: CreateChatRequestDTO): Promise<ChatSummaryDTO>;
}

export interface ICreateGroupChatUseCase {
  execute(params: CreateGroupChatRequestDTO): Promise<ChatSummaryDTO>;
}

export interface IAddGroupMemberUseCase {
  execute(params: AddGroupMemberRequestDTO): Promise<void>;
}

export interface IRemoveGroupMemberUseCase {
  execute(params: RemoveGroupMemberRequestDTO): Promise<void>;
}

export interface IUpdateGroupAdminUseCase {
  execute(params: UpdateGroupAdminRequestDTO): Promise<void>;
}

export interface IUpdateGroupSettingsUseCase {
  execute(params: UpdateGroupSettingsRequestDTO): Promise<void>;
}

export interface IUpdateGroupInfoUseCase {
  execute(params: UpdateGroupInfoRequestDTO): Promise<void>;
}

export interface ILeaveGroupUseCase {
  execute(params: LeaveGroupRequestDTO): Promise<void>;
}

export interface IEditMessageUseCase {
  execute(params: EditMessageRequestDTO): Promise<void>;
}

export interface IDeleteMessageUseCase {
  execute(params: DeleteMessageRequestDTO): Promise<void>;
}

export interface IReplyToMessageUseCase {
  execute(params: ReplyToMessageRequestDTO): Promise<Message>;
}

export interface IDeleteChatUseCase {
  execute(params: DeleteChatRequestDTO): Promise<void>;
}

export interface IBlockChatUseCase {
  execute(params: BlockChatRequestDTO): Promise<void>;
}

export interface IClearChatUseCase {
  execute(params: ClearChatRequestDTO): Promise<void>;
}
