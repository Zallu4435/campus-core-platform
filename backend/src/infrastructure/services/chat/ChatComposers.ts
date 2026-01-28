import { ChatController } from "../../../presentation/http/chat/ChatController";
import { ChatRepository } from "../../repositories/chat/ChatRepository";
import {
  GetChatsUseCase,
  SearchChatsUseCase,
  GetChatMessagesUseCase,
  SendMessageUseCase,
  MarkMessagesAsReadUseCase,
  AddReactionUseCase,
  RemoveReactionUseCase,
  GetChatDetailsUseCase,
  SearchUsersUseCase,
  CreateChatUseCase,
  CreateGroupChatUseCase,
  AddGroupMemberUseCase,
  RemoveGroupMemberUseCase,
  UpdateGroupAdminUseCase,
  UpdateGroupSettingsUseCase,
  UpdateGroupInfoUseCase,
  LeaveGroupUseCase,
  EditMessageUseCase,
  DeleteMessageUseCase,
  ReplyToMessageUseCase,
  DeleteChatUseCase,
  BlockChatUseCase,
  ClearChatUseCase,
  ToggleMuteUseCase
} from "../../../application/chat/useCases/ChatUseCases";
import {
  ISendMessageUseCase,
  ISearchChatsUseCase,
  ISearchUsersUseCase,
  IDeleteMessageUseCase,
  IGetChatsUseCase,
  IMarkMessagesAsReadUseCase,
  IAddReactionUseCase,
  IRemoveReactionUseCase,
  IGetChatDetailsUseCase,
  ICreateChatUseCase,
  ICreateGroupChatUseCase,
  IAddGroupMemberUseCase,
  IRemoveGroupMemberUseCase,
  IUpdateGroupAdminUseCase,
  IUpdateGroupSettingsUseCase,
  IUpdateGroupInfoUseCase,
  ILeaveGroupUseCase,
  IEditMessageUseCase,
  IReplyToMessageUseCase,
  IDeleteChatUseCase,
  IBlockChatUseCase,
  IClearChatUseCase,
  IGetChatMessagesUseCase,
  IToggleMuteUseCase,
} from "../../../application/chat/useCases/IChatUseCases";
import { storageService } from "../shared/CloudinaryStorageService";

export const getChatComposer = () => {
  const chatRepository = new ChatRepository();

  const getChatsUseCase: IGetChatsUseCase = new GetChatsUseCase(chatRepository);
  const searchChatsUseCase: ISearchChatsUseCase = new SearchChatsUseCase(chatRepository);
  const getChatMessagesUseCase: IGetChatMessagesUseCase = new GetChatMessagesUseCase(chatRepository);

  const sendMessageUseCase: ISendMessageUseCase = new SendMessageUseCase(chatRepository, storageService);

  const markMessagesAsReadUseCase: IMarkMessagesAsReadUseCase = new MarkMessagesAsReadUseCase(chatRepository);
  const addReactionUseCase: IAddReactionUseCase = new AddReactionUseCase(chatRepository);
  const removeReactionUseCase: IRemoveReactionUseCase = new RemoveReactionUseCase(chatRepository);
  const getChatDetailsUseCase: IGetChatDetailsUseCase = new GetChatDetailsUseCase(chatRepository);
  const searchUsersUseCase: ISearchUsersUseCase = new SearchUsersUseCase(chatRepository);
  const createChatUseCase: ICreateChatUseCase = new CreateChatUseCase(chatRepository);
  const createGroupChatUseCase: ICreateGroupChatUseCase = new CreateGroupChatUseCase(chatRepository);
  const addGroupMemberUseCase: IAddGroupMemberUseCase = new AddGroupMemberUseCase(chatRepository);
  const removeGroupMemberUseCase: IRemoveGroupMemberUseCase = new RemoveGroupMemberUseCase(chatRepository);
  const updateGroupAdminUseCase: IUpdateGroupAdminUseCase = new UpdateGroupAdminUseCase(chatRepository);
  const updateGroupSettingsUseCase: IUpdateGroupSettingsUseCase = new UpdateGroupSettingsUseCase(chatRepository);
  const updateGroupInfoUseCase: IUpdateGroupInfoUseCase = new UpdateGroupInfoUseCase(chatRepository);
  const leaveGroupUseCase: ILeaveGroupUseCase = new LeaveGroupUseCase(chatRepository);
  const editMessageUseCase: IEditMessageUseCase = new EditMessageUseCase(chatRepository);
  const deleteMessageUseCase: IDeleteMessageUseCase = new DeleteMessageUseCase(chatRepository);
  const replyToMessageUseCase: IReplyToMessageUseCase = new ReplyToMessageUseCase(chatRepository);
  const deleteChatUseCase: IDeleteChatUseCase = new DeleteChatUseCase(chatRepository);
  const blockChatUseCase: IBlockChatUseCase = new BlockChatUseCase(chatRepository);
  const clearChatUseCase: IClearChatUseCase = new ClearChatUseCase(chatRepository);
  const toggleMuteUseCase: IToggleMuteUseCase = new ToggleMuteUseCase(chatRepository);

  return new ChatController(
    getChatsUseCase,
    searchChatsUseCase,
    getChatMessagesUseCase,
    sendMessageUseCase,
    markMessagesAsReadUseCase,
    addReactionUseCase,
    removeReactionUseCase,
    getChatDetailsUseCase,
    searchUsersUseCase,
    createChatUseCase,
    createGroupChatUseCase,
    addGroupMemberUseCase,
    removeGroupMemberUseCase,
    updateGroupAdminUseCase,
    updateGroupSettingsUseCase,
    updateGroupInfoUseCase,
    leaveGroupUseCase,
    editMessageUseCase,
    deleteMessageUseCase,
    replyToMessageUseCase,
    deleteChatUseCase,
    blockChatUseCase,
    clearChatUseCase,
    toggleMuteUseCase
  );
}; 