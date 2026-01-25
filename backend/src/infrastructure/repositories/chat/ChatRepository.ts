import { IChatRepository, PaginatedResult, ChatDetails, CreatedChatSummary } from "../../../application/chat/repositories/IChatRepository";
import { ChatModel } from "../../database/mongoose/chat/ChatModel";
import { MessageModel } from "../../database/mongoose/chat/MessageModel";
import { User as UserModel } from "../../database/mongoose/auth/user.model";
import { FacultyUserModel as FacultyModel } from "../../database/mongoose/faculty/faculty.model";
import { Message, MessageStatus, MessageType } from "../../../domain/chat/entities/Message";
import { Chat, ChatType, ChatFilter } from "../../../domain/chat/entities/Chat";
import { ChatMapper } from "./ChatMapper";
import mongoose, { FilterQuery } from "mongoose";
import { IChatSource, IMessageSource } from "./infraTypes";

export class ChatRepository implements IChatRepository {
  async getChats(params: { userId: string; page: number; limit: number }): Promise<PaginatedResult<Chat>> {
    const { userId, page, limit } = params;
    const skip = (page - 1) * limit;

    const chats = await ChatModel.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await ChatModel.countDocuments({ participants: userId });
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: (chats as unknown as IChatSource[]).map(ChatMapper.toChatDomain),
      totalItems,
      totalPages,
      currentPage: page
    };
  }

  async searchChats(params: { userId: string; query: string; page: number; limit: number }): Promise<PaginatedResult<Chat> & { matchingUserIds: string[] }> {
    const { userId, query, page, limit } = params;
    const skip = (page - 1) * limit;

    const userSearchQuery = {
      _id: { $ne: new mongoose.Types.ObjectId(userId) },
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };

    const users = await UserModel.find(userSearchQuery).select('_id').lean();
    const matchingUserIds = users.map(user => user._id.toString());

    let searchQuery: Record<string, unknown> = {
      participants: {
        $in: [userId, ...matchingUserIds]
      }
    };

    if (query && query.trim().length > 0) {
      searchQuery.$or = [
        { name: { $regex: query.trim(), $options: "i" } },
        { "lastMessage.content": { $regex: query.trim(), $options: "i" } }
      ];
    }

    const chats = await ChatModel.find(searchQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await ChatModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: (chats as unknown as IChatSource[]).map(ChatMapper.toChatDomain),
      totalItems,
      totalPages,
      currentPage: page,
      matchingUserIds
    };
  }

  async getChatMessages(params: { chatId: string; userId: string; page: number; limit: number; before?: string }): Promise<PaginatedResult<Message>> {
    const { chatId, userId, page = 1, limit = 20, before } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      chatId,
      $or: [
        { deletedFor: { $exists: false } },
        { deletedFor: { $ne: userId } }
      ]
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await MessageModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await MessageModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: (messages as unknown as IMessageSource[]).map(ChatMapper.toMessageDomain),
      totalItems,
      totalPages,
      currentPage: page
    };
  }

  async sendMessage(params: { chatId: string; senderId: string; content: string; type: MessageType; attachments?: Array<{ type: MessageType; url: string; name: string; size: number; thumbnail?: string; duration?: number }> }): Promise<void> {
    const { chatId, senderId, content, type, attachments } = params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    if (chat.type === 'direct') {
      const receiverId = chat.participants.find((id: string) => id !== senderId);
      if (receiverId && chat.blockedUsers?.some((entry) => entry.blocker === receiverId && entry.blocked === senderId)) {
        throw new Error('You are blocked and cannot send messages to this user.');
      }
    }

    const message = await MessageModel.create({
      chatId,
      senderId,
      content,
      type,
      status: MessageStatus.Sent,
      attachments,
    });

    await ChatModel.findByIdAndUpdate(chatId, {
      lastMessage: {
        id: message._id.toString(),
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        status: message.status,
        attachments: message.attachments,
        createdAt: message.createdAt,
      },
      updatedAt: new Date(),
    });
  }

  async markMessagesAsRead(params: { chatId: string; userId: string }): Promise<void> {
    const { chatId, userId } = params;
    await MessageModel.updateMany(
      {
        chatId,
        senderId: { $ne: userId },
        status: MessageStatus.Sent,
      },
      {
        status: MessageStatus.Read,
        updatedAt: new Date(),
      }
    );
  }

  async addReaction(params: { messageId: string; userId: string; emoji: string }): Promise<void> {
    const { messageId, userId, emoji } = params;
    await MessageModel.findByIdAndUpdate(
      messageId,
      {
        $push: {
          reactions: {
            userId,
            emoji,
            createdAt: new Date(),
          },
        },
        updatedAt: new Date(),
      }
    );
  }

  async removeReaction(params: { messageId: string; userId: string }): Promise<void> {
    const { messageId, userId } = params;
    await MessageModel.findByIdAndUpdate(
      messageId,
      {
        $pull: {
          reactions: { userId },
        },
        updatedAt: new Date(),
      }
    );
  }

  async getChatDetails(chatId: string, userId: string): Promise<ChatDetails | null> {
    const chat = await ChatModel.findById(chatId).lean();
    if (!chat) return null;

    const messages = await MessageModel.find({
      chatId,
      $or: [
        { deletedFor: { $exists: false } },
        { deletedFor: { $ne: userId } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const participants = await UserModel.find({
      _id: { $in: chat.participants },
    })
      .select("firstName lastName email profilePicture")
      .lean();

    const unreadCount = await MessageModel.countDocuments({
      chatId: (chat as unknown as IChatSource)._id.toString(),
      senderId: { $ne: userId },
      status: MessageStatus.Sent,
    });

    return {
      chat: ChatMapper.toChatDomain(chat as unknown as IChatSource),
      messages: (messages as unknown as IMessageSource[]).map(ChatMapper.toMessageDomain),
      participants: participants.map((p: any) => ({
        id: p._id.toString(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        avatar: p.profilePicture
      })),
      unreadCount
    };
  }

  async searchUsers(params: { userId: string; query: string; page: number; limit: number }): Promise<PaginatedResult<{ id: string; firstName: string; lastName: string; email: string; avatar?: string; type: 'user' }>> {
    const { query, page, limit, userId } = params;
    const skip = (page - 1) * limit;
    const searchQuery = String(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const users = await UserModel.find({
      _id: { $ne: new mongoose.Types.ObjectId(userId) },
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .select('firstName lastName email profilePicture')
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await UserModel.countDocuments({
      _id: { $ne: new mongoose.Types.ObjectId(userId) },
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    });

    return {
      data: (users as unknown as Array<{ _id: mongoose.Types.ObjectId; firstName: string; lastName: string; email: string; profilePicture?: string }>).map(user => ({
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.profilePicture,
        type: 'user' as const
      })),
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    };
  }

  async createChat(params: { creatorId: string; participantId: string; type: string; name?: string; avatar?: string }): Promise<CreatedChatSummary> {
    const { creatorId, participantId, type, name, avatar } = params;

    if (type === 'direct') {
      const existingChat = await ChatModel.findOne({
        type: 'direct',
        participants: { $all: [creatorId, participantId] }
      });
      if (existingChat) throw new Error('Chat already exists');
    }

    const [userCreator, facultyCreator] = await Promise.all([
      UserModel.findById(creatorId),
      FacultyModel.findById(creatorId)
    ]);
    const creator = userCreator || facultyCreator;
    if (!creator) throw new Error('Creator not found');

    const [userParticipant, facultyParticipant] = await Promise.all([
      UserModel.findById(participantId),
      FacultyModel.findById(participantId)
    ]);
    const participant = userParticipant || facultyParticipant;
    if (!participant) throw new Error('Participant not found');

    const chat = await ChatModel.create({
      type,
      name: type === 'direct' ? `${participant.firstName} ${participant.lastName}` : name,
      avatar: type === 'direct' ? ((participant as unknown as { profilePicture: string }).profilePicture || '') : avatar,
      participants: [creatorId, participantId],
      createdBy: creatorId,
      admins: [creatorId],
      settings: {
        onlyAdminsCanPost: false,
        onlyAdminsCanAddMembers: false,
        onlyAdminsCanChangeInfo: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      id: chat._id.toString(),
      type: chat.type as ChatType,
      name: chat.name,
      avatar: chat.avatar,
      participants: [
        { id: creatorId, firstName: creator.firstName, lastName: creator.lastName, email: creator.email, avatar: (creator as unknown as { profilePicture: string }).profilePicture, isOnline: false },
        { id: participantId, firstName: participant.firstName, lastName: participant.lastName, email: participant.email, avatar: (participant as unknown as { profilePicture: string }).profilePicture, isOnline: false }
      ],
      unreadCount: 0,
      updatedAt: chat.updatedAt
    };
  }

  async createGroupChat(params: { name: string; description?: string; participants: string[]; creatorId: string; settings?: Record<string, unknown>; avatar?: string }): Promise<CreatedChatSummary> {
    const { creatorId, name, participants, description, settings } = params;

    const [userCreator, facultyCreator] = await Promise.all([
      UserModel.findById(creatorId),
      FacultyModel.findById(creatorId)
    ]);
    const creator = userCreator || facultyCreator;
    if (!creator) throw new Error('Creator not found');

    const [userParticipants, facultyParticipants] = await Promise.all([
      UserModel.find({ _id: { $in: participants } }),
      FacultyModel.find({ _id: { $in: participants } })
    ]);
    const allParticipants = [...userParticipants, ...facultyParticipants];
    if (allParticipants.length !== participants.length) throw new Error('One or more participants not found');

    const finalParticipants = [...new Set([...participants, creatorId])];

    const chat = await ChatModel.create({
      type: 'group',
      name,
      description,
      participants: finalParticipants,
      createdBy: creatorId,
      admins: [creatorId],
      avatar: params.avatar,
      settings: {
        onlyAdminsCanPost: (settings as Record<string, unknown>)?.onlyAdminsCanPost === true,
        onlyAdminsCanAddMembers: (settings as Record<string, unknown>)?.onlyAdminsCanAddMembers === true,
        onlyAdminsCanChangeInfo: (settings as Record<string, unknown>)?.onlyAdminsCanChangeInfo === true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      id: chat._id.toString(),
      type: chat.type as ChatType,
      name: chat.name,
      avatar: chat.avatar,
      participants: allParticipants.map((participant) => ({
        id: participant.id.toString(),
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        avatar: (participant as unknown as { profilePicture: string }).profilePicture,
        isOnline: false
      })),
      unreadCount: 0,
      updatedAt: chat.updatedAt
    };
  }

  async addGroupMember(params: { chatId: string; userId: string; addedBy: string }): Promise<void> {
    const { chatId, userId } = params;
    await ChatModel.findByIdAndUpdate(chatId, { $addToSet: { participants: userId } });
  }

  async removeGroupMember(params: { chatId: string; userId: string; removedBy: string }): Promise<void> {
    const { chatId, userId } = params;
    await ChatModel.findByIdAndUpdate(chatId, { $pull: { participants: userId, admins: userId } });
  }

  async updateGroupAdmin(params: { chatId: string; userId: string; isAdmin: boolean; updatedBy: string }): Promise<void> {
    const { chatId, userId, isAdmin } = params;
    if (isAdmin) {
      await ChatModel.findByIdAndUpdate(chatId, { $addToSet: { admins: userId } });
    } else {
      await ChatModel.findByIdAndUpdate(chatId, { $pull: { admins: userId } });
    }
  }

  async updateGroupSettings(params: { chatId: string; settings: Record<string, unknown>; updatedBy: string }): Promise<void> {
    const { chatId, settings } = params;
    const updateQuery: { [key: string]: boolean } = {};
    for (const key in settings) {
      if (Object.prototype.hasOwnProperty.call(settings, key)) {
        updateQuery[`settings.${key}`] = Boolean((settings as Record<string, unknown>)[key]);
      }
    }
    await ChatModel.findByIdAndUpdate(chatId, { $set: updateQuery });
  }

  async updateGroupInfo(params: { chatId: string; name?: string; description?: string; avatar?: string; updatedBy: string }): Promise<void> {
    const { chatId, name, description, avatar } = params;
    const update: Record<string, unknown> = {};
    if (name) update.name = name;
    if (description) update.description = description;
    if (avatar) update.avatar = avatar;
    await ChatModel.findByIdAndUpdate(chatId, { $set: update });
  }

  async leaveGroup(params: { chatId: string; userId: string }): Promise<void> {
    const { chatId, userId } = params;
    await ChatModel.findByIdAndUpdate(chatId, {
      $pull: { participants: userId, admins: userId }
    });
  }

  async editMessage(params: { chatId: string; messageId: string; content: string; userId: string }): Promise<void> {
    const { chatId, messageId, content, userId } = params;
    const message = await MessageModel.findOne({ _id: messageId, chatId });
    if (!message) throw new Error('Message not found');
    if (message.senderId.toString() !== userId) throw new Error('Not authorized');

    message.content = content;
    await message.save();

    const chat = await ChatModel.findById(chatId);
    if (chat?.lastMessage && (chat.lastMessage as unknown as { id: string }).id === messageId) {
      await ChatModel.findByIdAndUpdate(chatId, {
        "lastMessage.content": content
      });
    }
  }

  async deleteMessage(params: { messageId: string; userId: string; deleteForEveryone?: boolean }): Promise<void> {
    const { messageId, userId, deleteForEveryone } = params;
    const message = await MessageModel.findOne({ _id: messageId });
    if (!message) throw new Error('Message not found');

    if (deleteForEveryone) {
      if (message.senderId.toString() !== userId) throw new Error('Not authorized');
      message.isDeleted = true;
      message.deletedForEveryone = true;
    } else {
      if (!message.deletedFor) message.deletedFor = [];
      if (!message.deletedFor.includes(userId)) message.deletedFor.push(userId);
    }
    await message.save();
  }

  async replyToMessage(params: { chatId: string; messageId: string; content: string; userId: string }): Promise<void> {
    const { chatId, messageId, content, userId } = params;
    const original = await MessageModel.findById(messageId);
    if (!original) throw new Error('Original message not found');

    const message = await MessageModel.create({
      chatId,
      senderId: userId,
      content,
      type: MessageType.Text,
      status: MessageStatus.Sent,
      replyTo: {
        messageId: original._id.toString(),
        content: original.content,
        senderId: original.senderId
      }
    });

    await ChatModel.findByIdAndUpdate(chatId, {
      lastMessage: {
        id: message._id.toString(),
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        status: message.status,
        createdAt: message.createdAt
      },
      updatedAt: new Date()
    });
  }

  async deleteChat(params: { chatId: string; userId: string }): Promise<void> {
    const { chatId, userId } = params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Chat not found');
    if (!chat.participants.includes(userId)) throw new Error('Not authorized');
    await ChatModel.findByIdAndDelete(chatId);
    await MessageModel.deleteMany({ chatId });
  }

  async blockChat(params: { chatId: string; userId: string }): Promise<void> {
    const { chatId, userId } = params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    if (chat.type === 'direct') {
      const otherUserId = chat.participants.find((id: string) => id !== userId);
      if (otherUserId) {
        const isBlocked = chat.blockedUsers?.some((entry) => entry.blocker === userId && entry.blocked === otherUserId);
        if (isBlocked) {
          await ChatModel.findByIdAndUpdate(chatId, {
            $pull: { blockedUsers: { blocker: userId, blocked: otherUserId } }
          });
        } else {
          await ChatModel.findByIdAndUpdate(chatId, {
            $addToSet: { blockedUsers: { blocker: userId, blocked: otherUserId } }
          });
        }
      }
    }
  }

  async updateMessageStatus(messageId: string, status: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, { status, updatedAt: new Date() });
  }

  async clearChat(params: { chatId: string; userId: string }): Promise<void> {
    const { chatId, userId } = params;
    await MessageModel.updateMany({ chatId }, { $addToSet: { deletedFor: userId } });
  }

  async getUnreadCountForChat(params: { chatId: string; userId: string }): Promise<number> {
    return MessageModel.countDocuments({
      chatId: params.chatId,
      senderId: { $ne: params.userId },
      status: MessageStatus.Sent
    });
  }

  async getLastMessageForChat(params: { chatId: string; userId: string }): Promise<Message | null> {
    const last = await MessageModel.findOne({ chatId: params.chatId, deletedFor: { $ne: params.userId } })
      .sort({ createdAt: -1 })
      .lean();
    return last ? ChatMapper.toMessageDomain(last as unknown as IMessageSource) : null;
  }

  async getUsersByIds(ids: string[]): Promise<Array<{ id: string; firstName: string; lastName: string; email: string; avatar?: string }>> {
    const users = await UserModel.find({ _id: { $in: ids } }).select("firstName lastName email profilePicture").lean();
    return users.map((u: any) => ({ // Keep generic user map or improve
      id: u._id.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      avatar: u.profilePicture
    }));
  }
}