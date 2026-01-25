import { Video } from "../../../../domain/video/entities/Video";
import { IDiplomaInfo } from "../../../../domain/video/entities/VideoTypes";
import { Types } from "mongoose";

import { IVideoSource, IDiplomaInfoSource } from "../infraTypes";

export class VideoMappers {
    static toDomain(doc: IVideoSource | null): Video | null {
        if (!doc) return null;

        const diplomaIdObj = doc.diplomaId as unknown as IDiplomaInfoSource;
        const isPopulated = diplomaIdObj && typeof diplomaIdObj === 'object' && 'title' in diplomaIdObj;

        const diplomaInfo: IDiplomaInfo | undefined = isPopulated
            ? {
                id: diplomaIdObj._id.toString(),
                title: diplomaIdObj.title,
                category: diplomaIdObj.category
            }
            : undefined;

        const diplomaId = isPopulated
            ? diplomaIdObj._id.toString()
            : (doc.diplomaId?.toString() || '');

        return new Video({
            id: (doc._id instanceof Types.ObjectId ? doc._id.toString() : doc._id) || (doc as any).id,
            title: doc.title,
            duration: String(doc.duration),
            uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt as string | Date) : new Date(),
            module: doc.module,
            status: doc.status as any,
            diplomaId: diplomaId,
            description: doc.description,
            videoUrl: doc.videoUrl,
            diploma: diplomaInfo
        });
    }
}
