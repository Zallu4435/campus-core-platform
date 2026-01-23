import { IVideoRepository, IRepoDiploma } from '../../../application/video/repositories/IVideoRepository';
import { Video as VideoModel } from '../../database/mongoose/video/video.model';
import { Diploma as DiplomaModel } from '../../database/mongoose/diploma/diploma.model';
import { Video } from '../../../domain/video/entities/Video';
import { VideoMappers } from './mapper/VideoMappers';
import { VideoFilter } from '../../../domain/video/entities/Video';

export class VideoRepository implements IVideoRepository {
    async findVideos(query: VideoFilter, page: number, limit: number): Promise<Video[]> {
        const videos = await VideoModel.find(query)
            .populate('diplomaId', 'title category')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ module: 1, uploadedAt: -1 })
            .lean();

        return videos.map(VideoMappers.toDomain);
    }

    async countVideos(query: VideoFilter): Promise<number> {
        return VideoModel.countDocuments(query);
    }

    async findDiplomaByCategory(category: string): Promise<IRepoDiploma | null> {
        return DiplomaModel.findOne({ category }).lean() as unknown as IRepoDiploma;
    }

    async getVideoById(id: string): Promise<Video | null> {
        const video = await VideoModel.findById(id)
            .populate('diplomaId', 'title category')
            .lean();
        return VideoMappers.toDomain(video);
    }

    async createVideo(videoData: Partial<Video>): Promise<Video> {
        const created = await VideoModel.create(videoData);
        // We might need to populate immediately or handle in mapper
        // For consistency, let's just convert the created document
        const populated = await created.populate('diplomaId', 'title category');
        return VideoMappers.toDomain(populated.toObject());
    }

    async updateVideo(id: string, videoData: Partial<Video>): Promise<Video | null> {
        const updated = await VideoModel.findByIdAndUpdate(
            id,
            { $set: { ...videoData, updatedAt: new Date() } },
            { new: true, upsert: false }
        )
            .populate('diplomaId', 'title category')
            .lean();

        return VideoMappers.toDomain(updated);
    }

    async deleteVideo(id: string): Promise<void> {
        await VideoModel.findByIdAndDelete(id);
    }

    async findDiplomaById(id: string): Promise<IRepoDiploma | null> {
        return DiplomaModel.findById(id).lean() as unknown as IRepoDiploma;
    }

    async addVideoToDiploma(diplomaId: string, videoId: string): Promise<void> {
        await DiplomaModel.findByIdAndUpdate(diplomaId, { $addToSet: { videoIds: videoId } });
    }

    async removeVideoFromDiploma(diplomaId: string, videoId: string): Promise<void> {
        await DiplomaModel.findByIdAndUpdate(diplomaId, { $pull: { videoIds: videoId } });
    }
}