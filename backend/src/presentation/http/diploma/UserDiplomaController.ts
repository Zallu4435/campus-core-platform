import {
    IGetUserDiplomasUseCase,
    IGetUserDiplomaByIdUseCase,
    IGetUserDiplomaChapterUseCase,
    IUpdateVideoProgressUseCase,
    IMarkChapterCompleteUseCase,
    IToggleBookmarkUseCase,
    IGetCompletedChaptersUseCase,
    IGetBookmarkedChaptersUseCase
} from "../../../application/diploma/useCases/IUserDiplomaUseCases";
import { IUserDiplomaController, IHttpRequest, IHttpResponse, HttpSuccess, HttpErrors } from "../IHttp";
import { DIPLOMA_LIMITS } from "../../../application/diploma/constants/DiplomaConstants";

export class UserDiplomaController implements IUserDiplomaController {
    private _httpSuccess: HttpSuccess;
    private _httpErrors: HttpErrors;

    constructor(
        private readonly _getUserDiplomasUseCase: IGetUserDiplomasUseCase,
        private readonly _getUserDiplomaByIdUseCase: IGetUserDiplomaByIdUseCase,
        private readonly _getUserDiplomaChapterUseCase: IGetUserDiplomaChapterUseCase,
        private readonly _updateVideoProgressUseCase: IUpdateVideoProgressUseCase,
        private readonly _markChapterCompleteUseCase: IMarkChapterCompleteUseCase,
        private readonly _toggleBookmarkUseCase: IToggleBookmarkUseCase,
        private readonly _getCompletedChaptersUseCase: IGetCompletedChaptersUseCase,
        private readonly _getBookmarkedChaptersUseCase: IGetBookmarkedChaptersUseCase
    ) {
        this._httpSuccess = new HttpSuccess();
        this._httpErrors = new HttpErrors();
    }

    async getUserDiplomas(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) return this._httpErrors.error_401();

        const {
            page = DIPLOMA_LIMITS.DEFAULT_PAGE_SIZE,
            limit = DIPLOMA_LIMITS.DEFAULT_PAGE_SIZE,
            category,
            status,
            dateRange
        } = httpRequest.query;

        const data = await this._getUserDiplomasUseCase.execute({
            userId: httpRequest.user.id,
            page: Number(page),
            limit: Number(limit),
            category: category ? String(category) : undefined,
            status: status ? String(status) : undefined,
            dateRange: dateRange ? String(dateRange) : undefined
        });

        return this._httpSuccess.success_200(data);
    }

    async getUserDiplomaById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { id } = httpRequest.params;
        const data = await this._getUserDiplomaByIdUseCase.execute({ id });
        return this._httpSuccess.success_200(data);
    }

    async getUserDiplomaChapter(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { courseId, chapterId } = httpRequest.params;
        const data = await this._getUserDiplomaChapterUseCase.execute({ courseId, chapterId });
        return this._httpSuccess.success_200(data);
    }

    async updateVideoProgress(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) return this._httpErrors.error_401();

        const { courseId, chapterId } = httpRequest.params;
        const { progress } = httpRequest.body;

        const data = await this._updateVideoProgressUseCase.execute({
            userId: httpRequest.user.id,
            courseId,
            chapterId,
            progress: Number(progress)
        });

        return this._httpSuccess.success_200(data);
    }

    async markChapterComplete(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) return this._httpErrors.error_401();

        const { courseId, chapterId } = httpRequest.params;
        const data = await this._markChapterCompleteUseCase.execute({
            userId: httpRequest.user.id,
            courseId,
            chapterId
        });

        return this._httpSuccess.success_200(data);
    }

    async toggleBookmark(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) return this._httpErrors.error_401();

        const { courseId, chapterId } = httpRequest.params;
        const data = await this._toggleBookmarkUseCase.execute({
            userId: httpRequest.user.id,
            courseId,
            chapterId
        });

        return this._httpSuccess.success_200(data);
    }

    async getCompletedChapters(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) return this._httpErrors.error_401();

        const { courseId } = httpRequest.params;
        const data = await this._getCompletedChaptersUseCase.execute(httpRequest.user.id, courseId);
        return this._httpSuccess.success_200(data);
    }

    async getBookmarkedChapters(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) return this._httpErrors.error_401();

        const { courseId } = httpRequest.params;
        const data = await this._getBookmarkedChaptersUseCase.execute(httpRequest.user.id, courseId);
        return this._httpSuccess.success_200(data);
    }
}
