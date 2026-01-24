export enum NotificationStatus {
  SENT = "sent",
  FAILED = "failed",
  PENDING = "pending"
}

export enum NotificationRecipientType {
  INDIVIDUAL = "individual",
  ALL_STUDENTS = "all_students",
  ALL_FACULTY = "all_faculty",
  ALL = "all",
  ALL_STUDENTS_AND_FACULTY = "all_students_and_faculty",
}

export interface NotificationProps {
  id?: string;
  title: string;
  message: string;
  recipientType: NotificationRecipientType;
  recipientId?: string;
  recipientName?: string;
  createdBy: string;
  createdAt?: Date;
  status: NotificationStatus;
  readBy?: string[];
}
