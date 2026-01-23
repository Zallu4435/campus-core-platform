export interface Announcement {
  id: string;
  title: string;
  date: Date;
}

export interface Deadline {
  id: string;
  title: string;
  date: Date;
  urgent?: boolean;
  type: string;
}

export interface ClassInfo {
  id: string;
  title: string;
  faculty: string;
  schedule: string;
  course: string;
  description?: string;
}

export interface OnlineTopic {
  id: string;
  title: string;
  votes: number;
  voted: boolean;
}

export interface SpecialDate {
  type: string;
  title: string;
  date: string;
}

export interface StudentDashboardData {
  announcements: Announcement[];
  deadlines: Deadline[];
  classes: ClassInfo[];
  onlineTopics: OnlineTopic[];
  calendarDays: Record<number, SpecialDate[]>;
}
