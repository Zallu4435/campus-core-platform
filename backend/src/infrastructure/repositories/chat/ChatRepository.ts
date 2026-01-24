import { IChatRepository } from "../../../application/chat/repositories/IChatRepository";
import { ChatModel } from "../../database/mongoose/chat/ChatModel";
import { MessageModel } from "../../database/mongoose/chat/MessageModel";
import { User as UserModel } from "../../database/mongoose/auth/user.model";
import { FacultyUserModel as FacultyModel } from "../../database/mongoose/faculty/faculty.model";
import { MessageStatus, MessageType } from "../../../domain/chat/entities/Message";
import { ChatFilter, ChatType } from "../../../domain/chat/entities/Chat";

export class ChatRepository implements IChatRepository {
  async getChats(params: { userId: string; page: number; limit: number }) {
    const { userId, page, limit } = params;
    const skip = (page - 1) * limit;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const chats = await ChatModel.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await ChatModel.countDocuments({ participants: userId });
    const totalPages = Math.ceil(totalItems / limit);

    return { chats, totalItems, totalPages, currentPage: page };
  }

  async searchChats(params: { userId: string; query: string; page: number; limit: number }) {
    const { userId, query, page, limit } = params;
    const skip = (page - 1) * limit;

    const userSearchQuery = {
      _id: { $ne: userId },
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };

    const users = await UserModel.find(userSearchQuery).select('_id firstName lastName email profilePicture').lean();
    const matchingUserIds = users.map(user => user._id.toString());

    let searchQuery: ChatFilter = {
      participants: {
        $in: [userId, ...matchingUserIds]
      }
    };

    if (query && typeof query === 'string' && query.trim().length > 0) {
      searchQuery = {
        ...searchQuery,
        $or: [
          { name: { $regex: query.trim(), $options: "i" } },
          { "lastMessage.content": { $regex: query.trim(), $options: "i" } }
        ]
      };
    }

    const chats = await ChatModel.find(searchQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await ChatModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    return { chats, totalItems, totalPages, currentPage: page, matchingUserIds };
  }

  async getChatMessages(params: { chatId: string; userId: string; page: number; limit: number; before?: string }) {
    const { chatId, userId, page = 1, limit = 20, before } = params;
    const skip = (page - 1) * limit;

    const query: ChatFilter = {
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

    return { messages, totalItems, totalPages, currentPage: page };
  }

  async getUnreadCountForChat(params: { chatId: string; userId: string }) {
    const { chatId, userId } = params;
    return MessageModel.countDocuments({
      chatId,
      senderId: { $ne: userId },
      status: MessageStatus.Sent,
    });
  }

  async getLastMessageForChat(params: { chatId: string; userId: string }) {
    const { chatId, userId } = params;
    const last = await MessageModel.findOne({ chatId, deletedFor: { $ne: userId } })
      .sort({ createdAt: -1 })
      .lean();
    if (!last) return null;
    return {
      id: last._id.toString(),
      content: last.content,
      type: last.type,
      senderId: last.senderId,
      status: last.status,
      attachments: last.attachments,
      createdAt: last.createdAt,
    };
  }

  async getUsersByIds(ids: string[]) {
    const users = await UserModel.find({ _id: { $in: ids } })
      .select("firstName lastName email profilePicture")
      .lean();
    return users.map(u => ({
      id: u._id.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      avatar: u.profilePicture,
    }));
  }

  async sendMessage(params: { chatId: string; senderId: string; content: string; type: MessageType; attachments?: Array<{ type: MessageType; url: string; name?: string; size?: number; mimetype?: string }> }) {
    const { chatId, senderId, content, type, attachments } = params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Chat not found');
    if (chat.type === 'direct') {
      const receiverId = chat.participants.find((id: string) => id !== senderId);
      if (receiverId && chat.blockedUsers.some((entry) => entry.blocker === receiverId && entry.blocked === senderId)) {
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

  async markMessagesAsRead(params: { chatId: string; userId: string }) {
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

  async addReaction(params: { messageId: string; userId: string; emoji: string }) {
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
      },
      { new: true }
    );
  }

  async removeReaction(params: { messageId: string; userId: string }) {
    const { messageId, userId } = params;

    await MessageModel.findByIdAndUpdate(
      messageId,
      {
        $pull: {
          reactions: { userId },
        },
        updatedAt: new Date(),
      },
      { new: true }
    );
  }

  async getChatDetails(chatId: string, userId: string) {
    const chat = await ChatModel.findById(chatId).lean();
    if (!chat) {
      return null;
    }

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
      chatId: chat._id.toString(),
      senderId: { $ne: userId },
      status: MessageStatus.Sent,
    });

    return {
      chat,
      messages,
      participants,
      unreadCount,
    };
  }

  async searchUsers(params: { userId: string; query: string; page: number; limit: number }) {
    const { query, page = 1, limit = 20, userId } = params;
    const skip = (page - 1) * limit;

    const searchQuery = String(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const users = await UserModel.find({
      _id: { $ne: userId },
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

    const totalUsers = await UserModel.countDocuments({
      _id: { $ne: userId },
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    });

    const results = users.map(user => ({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.profilePicture,
      type: 'user' as const
    }));

    return {
      data: results,
      totalItems: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  }

  async createChat(params: { creatorId: string; participantId: string; type: string; name?: string; avatar?: string }) {
    const { creatorId, participantId, type, name, avatar } = params;

    if (type === 'direct') {
      const existingChat = await ChatModel.findOne({
        type: 'direct',
        participants: { $all: [creatorId, participantId] }
      });

      if (existingChat) {
        throw new Error('Chat already exists');
      }
    }

    const [userCreator, facultyCreator] = await Promise.all([
      UserModel.findById(creatorId),
      FacultyModel.findById(creatorId)
    ]);

    const creator = userCreator || facultyCreator;
    if (!creator) {
      throw new Error('Creator not found');
    }

    const [userParticipant, facultyParticipant] = await Promise.all([
      UserModel.findById(participantId),
      FacultyModel.findById(participantId)
    ]);

    const participant = userParticipant || facultyParticipant;
    if (!participant) {
      throw new Error('Participant not found');
    }

    const chat = await ChatModel.create({
      type,
      name: type === 'direct' ? `${participant.firstName} ${participant.lastName}` : name,
      avatar: type === 'direct' ? (participant.profilePicture || '') : avatar,
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
      type: chat.type,
      name: chat.name || '',
      avatar: chat.avatar || '',
      participants: [{
        id: creatorId,
        firstName: creator.firstName,
        lastName: creator.lastName,
        email: creator.email,
        avatar: creator.profilePicture,
        isOnline: false
      }, {
        id: participantId,
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        avatar: participant.profilePicture,
        isOnline: false
      }],
      unreadCount: 0,
      updatedAt: chat.updatedAt
    };
  }

  async editMessage(params: { chatId: string; messageId: string; content: string; userId: string }) {
    const { chatId, messageId, content, userId } = params;

    const message = await MessageModel.findOne({ _id: messageId, chatId });
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new Error('Not authorized to edit this message');
    }

    message.content = content;
    await message.save();

    const chat = await ChatModel.findById(chatId);
    if (chat?.lastMessage?.id === messageId) {
      await ChatModel.findByIdAndUpdate(chatId, {
        lastMessage: {
          ...chat.lastMessage,
          content: content,
          attachments: message.attachments
        }
      });
    }
  }

  async deleteMessage(params: { messageId: string; userId: string; deleteForEveryone?: boolean }) {
    const { messageId, userId, deleteForEveryone } = params;
    const message = await MessageModel.findOne({ _id: messageId });
    if (!message) {
      console.error('[deleteMessage] Message not found:', messageId);
      throw new Error('Message not found');
    }
    if (deleteForEveryone && message.senderId.toString() !== userId) {
      console.error('[deleteMessage] Not authorized to delete for everyone:', { messageId, userId, senderId: message.senderId });
      throw new Error('Not authorized to delete for everyone');
    }
    if (deleteForEveryone) {
      message.isDeleted = true;
      message.deletedForEveryone = true;
    } else {
      if (!message.deletedFor) {
        message.deletedFor = [];
      }
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
      }
    }
    await message.save();
    const chat = await ChatModel.findById(message.chatId);
    if (chat?.lastMessage?.id === messageId) {
      await ChatModel.findByIdAndUpdate(message.chatId, {
        lastMessage: {
          ...chat.lastMessage,
          content: deleteForEveryone ? 'This message was deleted' : chat.lastMessage.content,
          isDeleted: true,
          deletedForEveryone: deleteForEveryone
        }
      });
    }
  }

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    await MessageModel.findByIdAndUpdate(messageId, {
      status,
      updatedAt: new Date()
    });
  }

  async addGroupMember(params: { chatId: string; userId: string; addedBy: string }) {
    const { chatId, userId, addedBy } = params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    if (chat.type !== ChatType.Group) {
      throw new Error('Can only add members to group chats');
    }

    if (chat.settings.onlyAdminsCanAddMembers && !chat.admins.includes(addedBy)) {
      throw new Error('Only admins can add members');
    }

    if (chat.participants.includes(userId)) {
      throw new Error('User is already a member');
    }

    await ChatModel.findByIdAndUpdate(chatId, {
      $addToSet: { participants: userId }
    });
  }

  async removeGroupMember(params: { chatId: string; userId: string; removedBy: string }) {
    const { chatId, userId, removedBy } = params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    if (chat.type !== ChatType.Group) {
      throw new Error('Can only remove members from group chats');
    }

    if (!chat.admins.includes(removedBy)) {
      throw new Error('Only admins can remove members');
    }

    await ChatModel.findByIdAndUpdate(chatId, {
      $pull: {
        participants: userId,
        admins: userId
      }
    });
  }

  async updateGroupSettings(params: { chatId: string; settings: Record<string, unknown>; updatedBy: string }) {
    try {
      const { chatId, settings, updatedBy } = params;
      const chat = await ChatModel.findById(chatId);
      if (!chat) throw new Error('Chat not found');

      if (chat.type !== ChatType.Group) {
        throw new Error('Can only update settings for group chats');
      }

      if (!chat.admins.includes(updatedBy)) {
        throw new Error('Only admins can update group settings');
      }

      const updateQuery: { [key: string]: boolean } = {};
      for (const key in settings) {
        if (Object.prototype.hasOwnProperty.call(settings, key)) {
          updateQuery[`settings.${key}`] = Boolean((settings as Record<string, unknown>)[key]);
        }
      }

      await ChatModel.findByIdAndUpdate(chatId, { $set: updateQuery });
    } catch (error) {
      console.error('Error in updateGroupSettings repository:', error);
      throw error;
    }
  }

  async forwardMessage(messageId: string, targetChatId: string, forwardedBy: string) {
    const message = await MessageModel.findById(messageId);
    if (!message) throw new Error('Message not found');

    const newMessage = await MessageModel.create({
      chatId: targetChatId,
      senderId: forwardedBy,
      content: message.content,
      type: message.type,
      status: MessageStatus.Sent,
      attachments: message.attachments,
      forwardedFrom: {
        messageId: message._id.toString(),
        chatId: message.chatId,
        senderId: message.senderId
      }
    });

    await ChatModel.findByIdAndUpdate(targetChatId, {
      lastMessage: {
        id: newMessage._id.toString(),
        content: newMessage.content,
        type: newMessage.type,
        senderId: newMessage.senderId,
        status: newMessage.status,
        attachments: newMessage.attachments,
        createdAt: newMessage.createdAt
      },
      updatedAt: new Date()
    });
  }

  async replyToMessage(params: { chatId: string; messageId: string; content: string; userId: string }) {
    const { chatId, messageId, content, userId } = params;

    const originalMessage = await MessageModel.findById(messageId);
    if (!originalMessage) {
      throw new Error('Original message not found');
    }

    const newMessage = await MessageModel.create({
      chatId,
      senderId: userId,
      content,
      type: MessageType.Text,
      status: MessageStatus.Sent,
      replyTo: {
        messageId: originalMessage._id.toString(),
        content: originalMessage.content,
        senderId: originalMessage.senderId,
        type: originalMessage.type
      }
    });

    await ChatModel.findByIdAndUpdate(chatId, {
      lastMessage: {
        id: newMessage._id.toString(),
        content: newMessage.content,
        type: newMessage.type,
        senderId: newMessage.senderId,
        status: newMessage.status,
        attachments: newMessage.attachments,
        createdAt: newMessage.createdAt
      },
      updatedAt: new Date()
    });
  }

  async createGroupChat(params: { name: string; description?: string; participants: string[]; creatorId: string; settings?: Record<string, unknown>; avatar?: string }) {
    const { creatorId, name, participants, description, settings } = params;

    const [userCreator, facultyCreator] = await Promise.all([
      UserModel.findById(creatorId),
      FacultyModel.findById(creatorId)
    ]);

    const creator = userCreator || facultyCreator;
    if (!creator) {
      throw new Error('Creator not found');
    }

    const [userParticipants, facultyParticipants] = await Promise.all([
      UserModel.find({ _id: { $in: participants } }),
      FacultyModel.find({ _id: { $in: participants } })
    ]);

    const allParticipants = [...userParticipants, ...facultyParticipants];
    if (allParticipants.length !== participants.length) {
      throw new Error('One or more participants not found');
    }

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
        onlyAdminsCanPost: (settings as any)?.onlyAdminsCanPost || false,
        onlyAdminsCanAddMembers: (settings as any)?.onlyAdminsCanAddMembers || false,
        onlyAdminsCanChangeInfo: (settings as any)?.onlyAdminsCanChangeInfo || false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      id: chat._id.toString(),
      type: chat.type,
      name: chat.name,
      avatar: chat.avatar || '',
      participants: allParticipants.map(participant => ({
        id: participant._id.toString(),
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        avatar: participant.profilePicture,
        isOnline: false
      })),
      unreadCount: 0,
      updatedAt: chat.updatedAt
    };
  }

  async updateGroupAdmin(params: { chatId: string; userId: string; isAdmin: boolean; updatedBy: string }) {
    const { chatId, userId, isAdmin, updatedBy } = params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Chat not found');
    if (chat.type !== ChatType.Group) throw new Error('Can only update admins for group chats');
    if (!chat.admins.includes(updatedBy)) throw new Error('Only admins can update admin status');
    if (isAdmin) {
      await ChatModel.findByIdAndUpdate(chatId, { $addToSet: { admins: userId } });
    } else {
      await ChatModel.findByIdAndUpdate(chatId, { $pull: { admins: userId } });
    }
  }

  async updateGroupInfo(params: { chatId: string; name?: string; description?: string; avatar?: string; updatedBy: string }) {
    const { chatId, name, description, avatar, updatedBy } = params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Chat not found');
    if (chat.type !== ChatType.Group) throw new Error('Can only update info for group chats');
    if (!chat.admins.includes(updatedBy)) throw new Error('Only admins can update group info');
    const update: Record<string, string | undefined> = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (avatar !== undefined) update.avatar = avatar;
    await ChatModel.findByIdAndUpdate(chatId, { $set: update });
  }

  async leaveGroup(params: { chatId: string; userId: string }) {
    const { chatId, userId } = params;
    await ChatModel.findByIdAndUpdate(chatId, {
      $pull: {
        participants: userId,
        admins: userId
      }
    });
  }

  async deleteChat(params: { chatId: string; userId: string }) {
    const { chatId, userId } = params;
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Chat not found');
    if (!chat.participants.map(String).includes(String(userId))) throw new Error('Not authorized');
    await ChatModel.findByIdAndDelete(chatId);
    await MessageModel.deleteMany({ chatId });
  }

  async blockChat(params: { chatId: string; userId: string }) {
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
    } else {
    }
  }

  async clearChat(params: { chatId: string; userId: string }) {
    const { chatId, userId } = params;
    await MessageModel.updateMany(
      { chatId },
      { $addToSet: { deletedFor: userId } }
    );
  }
} 