import { Announcement, Deadline, ClassInfo, SpecialDate } from "../../../domain/student/entities/StudentDashboardTypes";
import { NewEventDTO } from "../../../application/student/dtos/StudentDashboardResponseDTOs";

export class StudentDashboardMapper {
    static toAnnouncement(raw: Record<string, unknown>): Announcement {
        return {
            id: raw._id?.toString() || raw.id?.toString() || '',
            title: (raw.subject || raw.title || 'No Title') as string,
            date: raw.createdAt ? new Date(raw.createdAt as string) : new Date(),
        };
    }

    static toDeadline(raw: Record<string, unknown>, urgentDays: number): Deadline {
        const dueDate = raw.dueDate ? new Date(raw.dueDate as string) : new Date();
        const isUrgent = raw.status === 'draft' || (dueDate.getTime() - Date.now() < urgentDays * 24 * 60 * 60 * 1000);

        return {
            id: raw._id?.toString() || raw.id?.toString() || '',
            title: (raw.title || 'Untitled') as string,
            date: dueDate,
            urgent: isUrgent,
            type: 'assignment'
        };
    }

    static toClassInfo(raw: Record<string, unknown>): ClassInfo {
        return {
            id: raw._id?.toString() || '',
            title: (raw.title || 'Untitled Session') as string,
            faculty: (raw.instructor || 'Staff') as string,
            schedule: raw.startTime ? new Date(raw.startTime as string).toISOString() : '',
            course: (raw.course || 'General') as string,
            description: raw.description as string | undefined
        };
    }

    static toNewEvent(raw: Record<string, unknown>): NewEventDTO {
        return {
            id: raw._id?.toString() || '',
            title: (raw.title || raw.name || 'Untitled Event') as string,
            date: raw.date ? new Date(raw.date as string) : (raw.createdAt ? new Date(raw.createdAt as string) : new Date()),
            location: (raw.location || 'Campus') as string,
            description: (raw.description || raw.about || '') as string
        };
    }
}
