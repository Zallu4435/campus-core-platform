import { ICommunicationRepository } from '../../../application/communication/repositories/ICommunicationRepository';
import { Message, UserInfo, Attachment } from "../../../domain/communication/entities/Communication";
import {
  UserRole,
  MessageStatus
} from '../../../domain/communication/enums/CommunicationEnums';
import { MessageModel, IMessage } from '../../database/mongoose/communication/communication.model';
import { User as UserModel } from '../../database/mongoose/auth/user.model';
import { Admin as AdminModel } from '../../database/mongoose/auth/admin.model';
import { FacultyUserModel as FacultyModel } from '../../database/mongoose/faculty/faculty.model';
import mongoose from 'mongoose';
import { CommunicationMapper } from './mappers/CommunicationMapper';

import { IMessageSource, IParamsUserSource, IRecipientSource } from './infraTypes';
import { IUserSource, IFacultySource, IAdminSource } from '../auth/infraTypes';

// Define explicit interfaces for query filters to avoid any type
interface MessageFilter {
  "recipients._id"?: string;
  "recipients.status"?: MessageStatus | string;
  "sender._id"?: string;
  $and?: Record<string, unknown>[];
  $or?: Record<string, unknown>[];
}

export class CommunicationRepository implements ICommunicationRepository {
  private messageModel: mongoose.Model<IMessage> = MessageModel as mongoose.Model<IMessage>;

  constructor() {
  }

  async getInboxMessages(userId: string, page: number, limit: number, search?: string, status?: string) {
    const query: MessageFilter = {
      "recipients._id": userId
    };
    if (status && status !== "all") {
      query.$and = [
        { "recipients._id": userId },
        { "recipients.status": status }
      ];
    }
    if (search) {
      const searchQuery = {
        $or: [
          { subject: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } }
        ]
      };
      if (query.$and) {
        query.$and.push(searchQuery);
      } else {
        query.$or = searchQuery.$or;
      }
    }
    const skip = (page - 1) * limit;
    const messages = await this.messageModel.find(query as mongoose.FilterQuery<IMessage>)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as IMessageSource[];

    // Map to Domain Entities
    const domainMessages = messages.map(msg => CommunicationMapper.toDomain(msg)).filter(msg => msg !== null) as Message[];

    const totalItems = await this.messageModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    return { messages: domainMessages, totalItems, totalPages, page, limit, userId, status, search };
  }

  async getSentMessages(userId: string, page: number, limit: number, search?: string, status?: string) {
    const query: MessageFilter = {
      "sender._id": userId
    };
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }
    const skip = (page - 1) * limit;
    const messages = await this.messageModel.find(query as mongoose.FilterQuery<IMessage>)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as IMessageSource[];

    const domainMessages = messages.map(msg => CommunicationMapper.toDomain(msg)).filter(msg => msg !== null) as Message[];

    const totalItems = await this.messageModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    return { messages: domainMessages, totalItems, totalPages, page, limit, userId, search };
  }

  async sendUserMessage(senderId: string, senderRole: string, to: Array<{ value: string; label: string }>, subject: string, content: string, attachments?: Attachment[]) {
    try {
      const sender = await this.findUserById(senderId, senderRole);

      if (!sender) {
        throw new Error('Sender not found');
      }

      let recipients: UserInfo[] = [];

      if (!Array.isArray(to)) {
        throw new Error('Invalid recipients format');
      }

      for (const recipient of to) {
        const admin = await this.findUserById(recipient.value, UserRole.Admin);
        if (admin) {
          recipients.push(admin);
        }
      }

      // Deduplicate
      recipients = recipients.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

      const messageData = {
        subject,
        content,
        sender: {
          _id: new mongoose.Types.ObjectId(sender.id),
          name: sender.name,
          email: sender.email,
          role: sender.role
        },
        recipients: recipients.map(r => ({
          _id: new mongoose.Types.ObjectId(r.id),
          name: r.name,
          email: r.email,
          role: r.role,
          status: MessageStatus.Unread
        })),
        isBroadcast: false,
        attachments: attachments || []
      };

      const message = await this.messageModel.create(messageData as unknown as Partial<IMessage>);
      const source = message.toObject ? message.toObject() : message;

      const domainMessage = CommunicationMapper.toDomain(source as unknown as IMessageSource);
      if (!domainMessage) throw new Error('Failed to map created message');
      return domainMessage;
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(senderId: string, senderRole: string, to: Array<{ value: string; label: string }>, subject: string, content: string, attachments?: Attachment[]) {
    try {
      const sender = await this.findUserById(senderId, senderRole);

      if (!sender) {
        throw new Error('Sender not found');
      }
      let recipients: UserInfo[] = [];

      if (!Array.isArray(to)) {
        throw new Error('Invalid recipients format');
      }

      let isBroadcast = false;

      for (const recipient of to) {
        if (recipient.value === 'all_students' || recipient.value === 'all-students') {
          const users = await UserModel.find({}).select('_id firstName lastName email').lean() as unknown as IUserSource[];
          const students = users.map((user) => ({
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: UserRole.Student
          }));
          recipients.push(...students);
          isBroadcast = true;
        } else {
          const user = await this.findUserById(recipient.value, UserRole.Student);
          if (user) {
            recipients.push(user);
          }
        }
      }
      recipients = recipients.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

      const messageData = {
        subject,
        content,
        sender: {
          _id: new mongoose.Types.ObjectId(sender.id),
          name: sender.name,
          email: sender.email,
          role: sender.role
        },
        recipients: recipients.map(r => ({
          _id: new mongoose.Types.ObjectId(r.id),
          name: r.name,
          email: r.email,
          role: r.role,
          status: MessageStatus.Unread
        })),
        isBroadcast: isBroadcast,
        attachments: attachments || []
      };

      const message = await this.messageModel.create(messageData as unknown as Partial<IMessage>);
      const source = message.toObject ? message.toObject() : message;

      const domainMessage = CommunicationMapper.toDomain(source as unknown as IMessageSource);
      if (!domainMessage) throw new Error('Failed to map created message');
      return domainMessage;
    } catch (error) {
      throw error;
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await this.updateMessageRecipientStatus(messageId, userId, MessageStatus.Read);
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    await this.messageModel.findByIdAndDelete(messageId);
  }

  async getMessageDetails(messageId: string): Promise<Message | null> {
    const message = await this.messageModel.findById(messageId).lean() as unknown as IMessageSource;
    return CommunicationMapper.toDomain(message);
  }

  async getAllAdmins(search?: string): Promise<UserInfo[]> {
    try {
      const query: mongoose.FilterQuery<any> = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ];
      }

      const admins = await AdminModel.find(query)
        .select("_id firstName lastName email")
        .lean() as unknown as IAdminSource[];

      return admins.map((admin) => {
        const firstName = admin.firstName || '';
        const lastName = admin.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          id: admin._id.toString(),
          name: fullName || 'Unknown Admin',
          email: admin.email,
          role: UserRole.Admin,
          firstName,
          lastName
        };
      });
    } catch (error) {
      throw error;
    }
  }

  async fetchUsers(type: string, search?: string): Promise<UserInfo[]> {
    const query: mongoose.FilterQuery<any> = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await UserModel.find(query)
      .select("_id firstName lastName email")
      .lean() as unknown as IUserSource[];

    return users.map((user) => {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();

      return {
        id: user._id.toString(),
        name: fullName || 'Unknown User',
        email: user.email,
        role: UserRole.Student,
        firstName,
        lastName
      };
    });
  }

  async findUserById(userId: string, role: string): Promise<UserInfo | null> {
    try {
      let user = null;
      if (role === UserRole.Admin || role === 'admin') {
        user = await AdminModel.findOne({ _id: userId }).lean() as unknown as IAdminSource;
        if (!user) return null;

        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          id: user._id.toString(),
          name: fullName || 'Unknown Admin',
          email: user.email,
          role: UserRole.Admin,
          firstName,
          lastName
        };
      } else {
        user = await UserModel.findOne({ _id: userId }).lean() as unknown as IUserSource;
        if (!user) return null;

        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          id: user._id.toString(),
          name: fullName || 'Unknown User',
          email: user.email,
          role: UserRole.Student,
          firstName,
          lastName
        };
      }
    } catch (error) {
      console.error('[findUserById] Error:', error);
      return null;
    }
  }

  async findMessageById(messageId: string): Promise<Message | null> {
    return this.getMessageDetails(messageId);
  }

  async createMessage(message: Message): Promise<void> {
    const persistenceData = CommunicationMapper.toPersistence(message);
    await this.messageModel.create(persistenceData);
  }

  async updateMessageRecipientStatus(messageId: string, userId: string, status: string): Promise<void> {
    await this.messageModel.updateOne(
      { _id: messageId, "recipients._id": userId },
      { $set: { "recipients.$.status": status } }
    );
  }

  async findAdmins(search?: string): Promise<UserInfo[]> {
    return this.getAllAdmins(search);
  }

  async findUsersByType(type: string, search?: string, requesterId?: string): Promise<UserInfo[]> {
    if (type === 'students' || type === 'all_students') {
      return this.fetchUsers(type, search);
    }

    if (type === 'faculty' || type === 'all_faculty') {
      const query: mongoose.FilterQuery<any> = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ];
      }
      const faculty = await FacultyModel.find(query)
        .select("_id firstName lastName email")
        .lean() as unknown as IFacultySource[];

      return faculty.map((user) => ({
        id: user._id.toString(),
        name: `${user.fullName}`,
        email: user.email,
        role: UserRole.Faculty,
        firstName: user.fullName ? user.fullName.split(' ')[0] : '',
        lastName: user.fullName ? user.fullName.split(' ').slice(1).join(' ') : ''
      }));
    }

    return [];
  }
}