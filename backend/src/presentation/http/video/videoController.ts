import {
    IGetVideosUseCase,
    IGetVideoByIdUseCase,
    ICreateVideoUseCase,
    IUpdateVideoUseCase,
    IDeleteVideoUseCase
} from '../../../application/video/useCases/IVideoUseCases';
import { IHttpRequest, IHttpResponse, IVideoController, HttpSuccess, HttpErrors } from '../IHttp';
import { InvalidVideoDataError } from '../../../domain/video/errors/VideoErrors';
import { VideoConstants } from '../../../application/video/constants/VideoConstants';

export class VideoController implements IVideoController {
    private _httpSuccess: HttpSuccess;
    private _httpErrors: HttpErrors;

    constructor(
        private readonly _getVideosUseCase: IGetVideosUseCase,
        private readonly _getVideoByIdUseCase: IGetVideoByIdUseCase,
        private readonly _createVideoUseCase: ICreateVideoUseCase,
        private readonly _updateVideoUseCase: IUpdateVideoUseCase,
        private readonly _deleteVideoUseCase: IDeleteVideoUseCase,
    ) {
        this._httpSuccess = new HttpSuccess();
        this._httpErrors = new HttpErrors();
    }

    async getVideos(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { page = 1, limit = 10, status, category, search, dateRange, startDate, endDate } = httpRequest.query;
        const result = await this._getVideosUseCase.execute({
            category: category as string,
            page: Number(page),
            limit: Number(limit),
            status: status as string | undefined,
            search: search as string | undefined,
            dateRange: dateRange as string | undefined,
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
        });
        return this._httpSuccess.success_200(result.data);
    }

    async getVideoById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { id } = httpRequest.params;
        if (!id) throw new InvalidVideoDataError(VideoConstants.Messages.MISSING_VIDEO_ID);

        const result = await this._getVideoByIdUseCase.execute({ id });
        return this._httpSuccess.success_200(result.data);
    }

    async createVideo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { title, category, module, status, description, duration } = httpRequest.body;
        const videoFile = httpRequest.file;

        // Validation of input types can be strengthened here or via Joi
        const result = await this._createVideoUseCase.execute({
            title,
            duration,
            module: Number(module),
            status,
            description,
            category,
            videoFile
        });
        return this._httpSuccess.success_201(result.data);
    }

    async updateVideo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { id } = httpRequest.params;
        const { title, duration, module, status, description, videoUrl, category } = httpRequest.body;
        const videoFile = httpRequest.file;

        if (!id) throw new InvalidVideoDataError(VideoConstants.Messages.MISSING_VIDEO_ID);

        const result = await this._updateVideoUseCase.execute({
            id,
            title,
            duration,
            module: module ? Number(module) : undefined,
            status,
            description,
            videoUrl,
            category,
            videoFile
        });
        return this._httpSuccess.success_200(result.data);
    }

    async deleteVideo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { id } = httpRequest.params;
        if (!id) throw new InvalidVideoDataError(VideoConstants.Messages.MISSING_VIDEO_ID);

        const result = await this._deleteVideoUseCase.execute({ id });
        return this._httpSuccess.success_200(result.data);
    }
}