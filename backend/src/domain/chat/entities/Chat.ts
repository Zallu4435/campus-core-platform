import { Message } from "./Message";

export interface GroupSettings {
  onlyAdminsCanPost: boolean;
  onlyAdminsCanAddMembers: boolean;
  onlyAdminsCanChangeInfo: boolean;
}

export interface GroupInfo {
  description?: string;
  rules?: string;
  joinLink?: string;
  settings: GroupSettings;
}

export interface UserChatMeta {
  userId: string;
  clearedAt?: Date;
  isDeleted?: boolean;
  isMuted?: boolean;
}

export interface ChatProps {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
  type: ChatType;
  name?: string;
  avatar?: string;
  description?: string;
  admins?: string[];
  creatorId?: string;
  settings?: GroupSettings;
  rules?: string;
  joinLink?: string;
  blockedUsers?: { blocker: string; blocked: string }[];
  userChatMeta?: UserChatMeta[];
}

export enum ChatType {
  Direct = "direct",
  Group = "group"
}

export class Chat {
  private props: ChatProps;

  constructor(props: ChatProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get participants(): string[] {
    return this.props.participants;
  }

  get lastMessage(): Message | undefined {
    return this.props.lastMessage;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get type(): ChatType {
    return this.props.type;
  }

  get name(): string | undefined {
    return this.props.name;
  }

  get avatar(): string | undefined {
    return this.props.avatar;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get admins(): string[] | undefined {
    return this.props.admins;
  }

  get creatorId(): string | undefined {
    return this.props.creatorId;
  }

  get settings(): GroupSettings | undefined {
    return this.props.settings;
  }

  get rules(): string | undefined {
    return this.props.rules;
  }

  get joinLink(): string | undefined {
    return this.props.joinLink;
  }

  get groupInfo(): GroupInfo | undefined {
    if (this.type === ChatType.Group) {
      return {
        description: this.description,
        rules: this.rules,
        joinLink: this.joinLink,
        settings: this.settings || {
          onlyAdminsCanPost: false,
          onlyAdminsCanAddMembers: false,
          onlyAdminsCanChangeInfo: false
        }
      };
    }
    return undefined;
  }

  get blockedUsers(): { blocker: string; blocked: string }[] | undefined {
    return this.props.blockedUsers;
  }

  get userChatMeta(): UserChatMeta[] | undefined {
    return this.props.userChatMeta;
  }

  updateLastMessage(message: Message): void {
    this.props.lastMessage = message;
    this.props.updatedAt = new Date();
  }

  addParticipant(userId: string): void {
    if (!this.props.participants.includes(userId)) {
      this.props.participants.push(userId);
      this.props.updatedAt = new Date();
    }
  }

  removeParticipant(userId: string): void {
    this.props.participants = this.props.participants.filter(id => id !== userId);
    if (this.props.admins) {
      this.props.admins = this.props.admins.filter(id => id !== userId);
    }
    this.props.updatedAt = new Date();
  }

  addAdmin(userId: string): void {
    if (!this.props.admins) {
      this.props.admins = [];
    }
    if (!this.props.admins.includes(userId)) {
      this.props.admins.push(userId);
      this.props.updatedAt = new Date();
    }
  }

  removeAdmin(userId: string): void {
    if (this.props.admins) {
      this.props.admins = this.props.admins.filter(id => id !== userId);
      this.props.updatedAt = new Date();
    }
  }

  updateSettings(settings: Partial<GroupSettings>): void {
    if (!this.props.settings) {
      this.props.settings = {
        onlyAdminsCanPost: false,
        onlyAdminsCanAddMembers: false,
        onlyAdminsCanChangeInfo: false
      };
    }
    this.props.settings = { ...this.props.settings, ...settings };
    this.props.updatedAt = new Date();
  }

  updateInfo(info: { name?: string; description?: string; avatar?: string; rules?: string; joinLink?: string }): void {
    if (info.name) this.props.name = info.name;
    if (info.description) this.props.description = info.description;
    if (info.avatar) this.props.avatar = info.avatar;
    if (info.rules) this.props.rules = info.rules;
    if (info.joinLink) this.props.joinLink = info.joinLink;
    this.props.updatedAt = new Date();
  }
}

export interface ChatFilter {
  participants?: string[];
  type?: ChatType;
  name?: string;
  avatar?: string;
  lastMessageContent?: string;
  chatId?: string;
  excludeDeletedFor?: string;
  id?: string;
}