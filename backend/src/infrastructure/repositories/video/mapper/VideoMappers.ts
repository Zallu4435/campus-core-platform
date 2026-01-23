import { Video } from "../../../../domain/video/entities/Video";
import { IDiplomaInfo } from "../../../../domain/video/entities/VideoTypes";

export class VideoMappers {
    static toDomain(doc: any): Video {
        if (!doc) return null;

        const diplomaInfo: IDiplomaInfo | undefined = (doc.diplomaId && typeof doc.diplomaId === 'object' && 'title' in doc.diplomaId)
            ? {
                id: doc.diplomaId._id?.toString() || doc.diplomaId.toString(),
                title: doc.diplomaId.title,
                category: doc.diplomaId.category
            }
            : undefined;

        const diplomaId = (doc.diplomaId && typeof doc.diplomaId === 'object' && '_id' in doc.diplomaId)
            ? doc.diplomaId._id.toString()
            : (doc.diplomaId?.toString() || '');

        return new Video({
            id: doc._id?.toString() || doc.id,
            title: doc.title,
            duration: doc.duration,
            uploadedAt: doc.uploadedAt,
            module: doc.module,
            status: doc.status,
            diplomaId: diplomaId,
            description: doc.description,
            videoUrl: doc.videoUrl,
            diploma: diplomaInfo
        });
    }
}
