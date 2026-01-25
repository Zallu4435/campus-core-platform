import { IVideoRepository, RepoDiplomaInfo } from '../../../application/video/repositories/IVideoRepository';
import { Video as VideoModel } from '../../database/mongoose/video/video.model';
import { Diploma as DiplomaModel } from '../../database/mongoose/diploma/diploma.model';
import { Video, VideoFilter } from '../../../domain/video/entities/Video';
import { VideoMappers } from './mapper/VideoMappers';

import mongoose, { FilterQuery, Types } from 'mongoose';
import { IVideoSource } from './infraTypes';

export class VideoRepository implements IVideoRepository {
    async findVideos(filter: VideoFilter, page: number, limit: number): Promise<Video[]> {
        const query: FilterQuery<IVideoSource> = {};
        if (filter.diplomaId) query.diplomaId = filter.diplomaId;
        if (filter.status) query.status = filter.status;
        if (filter.id) query._id = filter.id;
        if (filter.search) {
            const searchRegex = { $regex: filter.search, $options: 'i' };
            query.$or = [{ title: searchRegex }, { description: searchRegex }];
        }
        if (filter.startDate || filter.endDate) {
            query.uploadedAt = {};
            if (filter.startDate) query.uploadedAt.$gte = filter.startDate;
            if (filter.endDate) query.uploadedAt.$lte = filter.endDate;
        }

        const videos = await VideoModel.find(query)
            .populate('diplomaId', 'title category')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ module: 1, uploadedAt: -1 })
            .lean() as unknown as IVideoSource[];

        return videos.map(VideoMappers.toDomain).filter((v): v is Video => v !== null);
    }

    async countVideos(filter: VideoFilter): Promise<number> {
        const query: FilterQuery<IVideoSource> = {};
        if (filter.diplomaId) query.diplomaId = filter.diplomaId;
        if (filter.status) query.status = filter.status;
        if (filter.id) query._id = filter.id;
        if (filter.search) {
            const searchRegex = { $regex: filter.search, $options: 'i' };
            query.$or = [{ title: searchRegex }, { description: searchRegex }];
        }
        if (filter.startDate || filter.endDate) {
            query.uploadedAt = {};
            if (filter.startDate) query.uploadedAt.$gte = filter.startDate;
            if (filter.endDate) query.uploadedAt.$lte = filter.endDate;
        }
        return VideoModel.countDocuments(query);
    }

    async findDiplomaByCategory(category: string): Promise<RepoDiplomaInfo | null> {
        const diploma = await DiplomaModel.findOne({ category }).lean();
        if (!diploma) return null;
        return {
            id: diploma._id.toString(),
            title: diploma.title,
            category: diploma.category,
            videoIds: diploma.videoIds?.map((id: Types.ObjectId | string) => id.toString()) || []
        };
    }

    async getVideoById(id: string): Promise<Video | null> {
        const video = await VideoModel.findById(id)
            .populate('diplomaId', 'title category')
            .lean() as unknown as IVideoSource;
        return VideoMappers.toDomain(video);
    }

    async createVideo(videoData: Partial<Video>): Promise<Video> {
        const created = await VideoModel.create(videoData);
        // We might need to populate immediately or handle in mapper
        // For consistency, let's just convert the created document
        const populated = await created.populate('diplomaId', 'title category');
        return VideoMappers.toDomain(populated.toObject() as unknown as IVideoSource)!;
    }

    async updateVideo(id: string, videoData: Partial<Video>): Promise<Video | null> {
        const updated = await VideoModel.findByIdAndUpdate(
            id,
            { $set: { ...videoData, updatedAt: new Date() } },
            { new: true, upsert: false }
        )
            .populate('diplomaId', 'title category')
            .lean() as unknown as IVideoSource;

        return VideoMappers.toDomain(updated);
    }

    async deleteVideo(id: string): Promise<void> {
        await VideoModel.findByIdAndDelete(id);
    }

    async findDiplomaById(id: string): Promise<RepoDiplomaInfo | null> {
        const diploma = await DiplomaModel.findById(id).lean();
        if (!diploma) return null;
        return {
            id: diploma._id.toString(),
            title: diploma.title,
            category: diploma.category,
            videoIds: diploma.videoIds?.map((id: Types.ObjectId | string) => id.toString()) || []
        };
    }

    async addVideoToDiploma(diplomaId: string, videoId: string): Promise<void> {
        await DiplomaModel.findByIdAndUpdate(diplomaId, { $addToSet: { videoIds: videoId } });
    }

    async removeVideoFromDiploma(diplomaId: string, videoId: string): Promise<void> {
        await DiplomaModel.findByIdAndUpdate(diplomaId, { $pull: { videoIds: videoId } });
    }
}