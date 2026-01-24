import { IVideoRepository, RepoDiplomaInfo } from '../repositories/IVideoRepository';
import { IVideoStorageService } from '../services/IVideoStorageService';
import { Video, VideoFilter } from '../../../domain/video/entities/Video';
import {
    GetVideosRequestDTO,
    GetVideoByIdRequestDTO,
    CreateVideoRequestDTO,
    UpdateVideoRequestDTO,
    DeleteVideoRequestDTO
} from '../dtos/VideoRequestDTOs';
import {
    GetVideosResponseDTO,
    GetVideoByIdResponseDTO,
    CreateVideoResponseDTO,
    UpdateVideoResponseDTO,
    ResponseDTO
} from '../dtos/VideoResponseDTOs';
import { VideoConstants } from '../constants/VideoConstants';
import {
    InvalidVideoIdError,
    VideoNotFoundError,
    InvalidDiplomaIdError,
    InvalidVideoDataError
} from '../../../domain/video/errors/VideoErrors';
import {
    IGetVideosUseCase,
    IGetVideoByIdUseCase,
    ICreateVideoUseCase,
    IUpdateVideoUseCase,
    IDeleteVideoUseCase
} from "./IVideoUseCases";
import { IDiplomaInfo } from '../../../domain/video/entities/VideoTypes';
import Logger from '../../../shared/utils/logger';


export class GetVideosUseCase implements IGetVideosUseCase {
    constructor(private _videoRepository: IVideoRepository) { }

    async execute(params: GetVideosRequestDTO): Promise<ResponseDTO<GetVideosResponseDTO>> {
        const page = params.page || VideoConstants.Pagination.DEFAULT_PAGE;
        const limit = params.limit || VideoConstants.Pagination.DEFAULT_LIMIT;

        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            throw new InvalidVideoDataError(VideoConstants.Messages.INVALID_PAGINATION);
        }

        const query = await this.buildQuery(params);

        const [videos, totalItems] = await Promise.all([
            this._videoRepository.findVideos(query, page, limit),
            this._videoRepository.countVideos(query)
        ]);

        const mappedVideos = this.mapVideosToDTO(videos);
        const totalPages = Math.ceil(totalItems / limit);

        const result: GetVideosResponseDTO = {
            data: mappedVideos,
            totalItems,
            totalPages,
            currentPage: page,
        };

        return { data: result, success: true };
    }

    private async buildQuery(params: GetVideosRequestDTO): Promise<VideoFilter> {
        const { category, status, dateRange, startDate, endDate, search } = params;
        let query: VideoFilter = {};

        if (category && category !== 'all') {
            const diploma = await this._videoRepository.findDiplomaByCategory(category);
            if (!diploma) {
                throw new InvalidDiplomaIdError();
            }
            query.diplomaId = diploma._id;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (dateRange && dateRange !== 'all' && dateRange !== VideoConstants.DateRanges.CUSTOM) {
            query.uploadedAt = this.buildDateRangeQuery(dateRange, startDate, endDate);
        } else if (dateRange === VideoConstants.DateRanges.CUSTOM) {
            query.uploadedAt = this.buildDateRangeQuery(dateRange, startDate, endDate);
        }

        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        return query;
    }

    private buildDateRangeQuery(dateRange: string, startDate?: string, endDate?: string) {
        const now = new Date();

        switch (dateRange) {
            case VideoConstants.DateRanges.LAST_WEEK:
                return {
                    $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                };
            case VideoConstants.DateRanges.LAST_MONTH:
                return {
                    $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                };
            case VideoConstants.DateRanges.LAST_3_MONTHS:
                return {
                    $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
                };
            case VideoConstants.DateRanges.CUSTOM:
                if (startDate && endDate) {
                    const startDateTime = new Date(startDate);
                    const endDateTime = new Date(endDate);
                    endDateTime.setHours(23, 59, 59, 999);

                    return {
                        $gte: startDateTime,
                        $lte: endDateTime,
                    };
                }
                break;
        }
        return undefined;
    }

    private mapVideosToDTO(videos: Video[]) {
        return videos.map(video => ({
            id: video.id,
            title: video.title,
            duration: video.duration,
            module: video.module,
            status: video.status,
            uploadedAt: video.uploadedAt,
            videoUrl: video.videoUrl,
            description: video.description,
            diplomaId: video.diplomaId,
            diploma: video.diploma ? {
                id: video.diploma.id,
                title: video.diploma.title,
                category: video.diploma.category
            } : undefined
        }));
    }
}


export class GetVideoByIdUseCase implements IGetVideoByIdUseCase {
    constructor(private _videoRepository: IVideoRepository) { }

    async execute(params: GetVideoByIdRequestDTO): Promise<ResponseDTO<GetVideoByIdResponseDTO>> {
        if (!params.id) {
            throw new InvalidVideoIdError();
        }
        const video = await this._videoRepository.getVideoById(params.id);
        if (!video) {
            throw new VideoNotFoundError(params.id);
        }

        let diplomaInfo: IDiplomaInfo | undefined = video.diploma;

        if (!diplomaInfo && video.diplomaId) {
            const diploma = await this._videoRepository.findDiplomaById(video.diplomaId);
            if (diploma) {
                diplomaInfo = {
                    id: diploma._id!.toString(),
                    title: diploma.title,
                    category: diploma.category
                };
                video.diploma = diplomaInfo;
            }
        }

        return { data: { video }, success: true };
    }
}

export class CreateVideoUseCase implements ICreateVideoUseCase {
    constructor(
        private _videoRepository: IVideoRepository,
        private _videoStorageService: IVideoStorageService
    ) { }

    async execute(params: CreateVideoRequestDTO): Promise<ResponseDTO<CreateVideoResponseDTO>> {
        if (!params.category) {
            throw new InvalidDiplomaIdError();
        }
        if (!params.description || params.description.trim() === '') {
            throw new InvalidVideoDataError(VideoConstants.Messages.DESCRIPTION_REQUIRED);
        }
        const diploma = await this._videoRepository.findDiplomaByCategory(params.category);
        if (!diploma) {
            throw new InvalidDiplomaIdError();
        }
        let videoUrl = '';
        if (params.videoFile) {
            videoUrl = await this._videoStorageService.uploadVideo(params.videoFile.path);
        }
        const videoData: Partial<Video> = {
            title: params.title,
            duration: params.duration,
            module: params.module,
            status: params.status,
            description: params.description,
            diplomaId: diploma._id,
            uploadedAt: new Date(),
            videoUrl
        };
        const created = await this._videoRepository.createVideo(videoData);
        await this._videoRepository.addVideoToDiploma(diploma._id!, created.id);

        return { data: { video: created }, success: true };
    }
}

export class UpdateVideoUseCase implements IUpdateVideoUseCase {
    constructor(
        private _videoRepository: IVideoRepository,
        private _videoStorageService: IVideoStorageService
    ) { }

    async execute(params: UpdateVideoRequestDTO): Promise<ResponseDTO<UpdateVideoResponseDTO>> {
        if (!params.id) {
            throw new InvalidVideoIdError();
        }

        const existingVideo = await this._videoRepository.getVideoById(params.id);
        if (!existingVideo) {
            throw new VideoNotFoundError(params.id);
        }

        const updateData: Partial<Video> = { ...params };

        const oldDiplomaId = existingVideo.diplomaId;
        let categoryChanged = false;
        let newDiplomaId: string | undefined = undefined;

        if (params.category && params.category.trim()) {
            const newDiploma = await this._videoRepository.findDiplomaByCategory(params.category);
            if (!newDiploma) {
                throw new InvalidDiplomaIdError();
            }
            newDiplomaId = newDiploma._id!;
            if (newDiplomaId && newDiplomaId !== oldDiplomaId) {
                categoryChanged = true;
            }
            updateData.diplomaId = newDiplomaId;
        }

        if (params.videoFile) {
            if (existingVideo.videoUrl) {
                await this._videoStorageService.deleteVideo(existingVideo.videoUrl);
            }
            updateData.videoUrl = await this._videoStorageService.uploadVideo(params.videoFile.path);
        } else {
            if (params.videoUrl && params.videoUrl.trim().startsWith('http')) {
                updateData.videoUrl = params.videoUrl;
            } else {
                updateData.videoUrl = existingVideo.videoUrl;
            }
        }

        const updated = await this._videoRepository.updateVideo(params.id, updateData);
        if (!updated) {
            throw new VideoNotFoundError(params.id);
        }

        if (categoryChanged && newDiplomaId && oldDiplomaId) {
            try {
                await this._videoRepository.removeVideoFromDiploma(oldDiplomaId, params.id);
                await this._videoRepository.addVideoToDiploma(newDiplomaId, params.id);
            } catch (err) {
                Logger.error('⚠️ [UseCase] Failed to move video between diploma arrays', err);
            }
        }

        return { data: { video: updated }, success: true };
    }
}

export class DeleteVideoUseCase implements IDeleteVideoUseCase {
    constructor(
        private _videoRepository: IVideoRepository,
        private _videoStorageService: IVideoStorageService
    ) { }

    async execute(params: DeleteVideoRequestDTO): Promise<ResponseDTO<{ message: string }>> {
        if (!params.id) {
            throw new InvalidVideoIdError();
        }
        const video = await this._videoRepository.getVideoById(params.id);
        if (!video) {
            throw new VideoNotFoundError(params.id);
        }

        if (video.videoUrl) {
            await this._videoStorageService.deleteVideo(video.videoUrl);
        }

        if (video.diplomaId) {
            await this._videoRepository.removeVideoFromDiploma(video.diplomaId, video.id);
        }

        await this._videoRepository.deleteVideo(params.id);

        return { data: { message: VideoConstants.Messages.VIDEO_DELETED }, success: true };
    }
}