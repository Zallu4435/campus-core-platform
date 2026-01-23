import { DiplomaCourse, Chapter } from '../../../../domain/diploma/types';
import { IDiplomaDocument, IVideoDocument } from '../infraTypes';

export class UserDiplomaMapper {
    static toDiplomaCourse(
        doc: IDiplomaDocument,
        videoCount: number,
        completedVideoCount: number
    ): DiplomaCourse {
        return {
            id: doc._id.toString(),
            title: doc.title,
            description: doc.description,
            category: doc.category,
            status: doc.status ? 'published' : 'draft',
            instructor: 'Faculty Instructor',
            department: doc.category || 'General',
            chapters: [],
            videoCount,
            completedVideoCount,
            createdAt: doc.createdAt || new Date(),
            updatedAt: doc.updatedAt || new Date()
        };
    }

    static toChapter(video: IVideoDocument): Chapter {
        return {
            id: video._id.toString(),
            title: video.title,
            description: video.description,
            videoUrl: video.videoUrl || '',
            duration: parseInt(video.duration) || 0,
            order: video.module || 0,
            isPublished: true, // Assuming published if retrieved for user
            createdAt: video.uploadedAt || new Date(),
            updatedAt: video.uploadedAt || new Date()
        };
    }

    static toDiplomaCourseWithChapters(
        doc: IDiplomaDocument,
        chapters: Chapter[]
    ): DiplomaCourse {
        return {
            id: doc._id.toString(),
            title: doc.title,
            description: doc.description,
            category: doc.category,
            status: doc.status ? 'published' : 'draft',
            instructor: 'Faculty Instructor',
            department: doc.category || 'General',
            chapters,
            createdAt: doc.createdAt || new Date(),
            updatedAt: doc.updatedAt || new Date()
        };
    }
}
