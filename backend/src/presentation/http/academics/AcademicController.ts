import {
    IGetStudentInfoUseCase,
    IGetGradeInfoUseCase,
    IGetCoursesUseCase,
    IGetAcademicHistoryUseCase,
    IGetProgramInfoUseCase,
    IGetProgressInfoUseCase,
    IGetRequirementsInfoUseCase,
    IRegisterCourseUseCase,
    IDropCourseUseCase,
    IRequestTranscriptUseCase,
} from "../../../application/academics/useCases/IAcademicUseCases";
import { IHttpRequest, IHttpResponse, HttpSuccess, HttpErrors } from "../IHttp";
import { IAcademicController } from "../IHttp"
import { InvalidActionError } from "../../../domain/academics/errors/AcademicErrors";

export class AcademicController implements IAcademicController {
    private _httpSuccess: HttpSuccess;
    private _httpErrors: HttpErrors;

    constructor(
        private readonly _getStudentInfoUseCase: IGetStudentInfoUseCase,
        private readonly _getGradeInfoUseCase: IGetGradeInfoUseCase,
        private readonly _getCoursesUseCase: IGetCoursesUseCase,
        private readonly _getAcademicHistoryUseCase: IGetAcademicHistoryUseCase,
        private readonly _getProgramInfoUseCase: IGetProgramInfoUseCase,
        private readonly _getProgressInfoUseCase: IGetProgressInfoUseCase,
        private readonly _getRequirementsInfoUseCase: IGetRequirementsInfoUseCase,
        private readonly _registerCourseUseCase: IRegisterCourseUseCase,
        private readonly _dropCourseUseCase: IDropCourseUseCase,
        private readonly _requestTranscriptUseCase: IRequestTranscriptUseCase,
    ) {
        this._httpSuccess = new HttpSuccess();
        this._httpErrors = new HttpErrors();
    }

    async getStudentInfo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) {
            return this._httpErrors.error_401();
        }
        const result = await this._getStudentInfoUseCase.execute({ userId: httpRequest.user.userId });
        return this._httpSuccess.success_200(result.data);
    }

    async getGradeInfo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) {
            return this._httpErrors.error_401();
        }
        const result = await this._getGradeInfoUseCase.execute({
            userId: httpRequest.user.userId,
        });
        return this._httpSuccess.success_200(result.data);
    }

    async getCourses(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { search, page = 1, limit = 10 } = httpRequest.query;
        const defaultLimit = search ? Number(limit) : 5;
        const userId = httpRequest.user?.userId;
        const result = await this._getCoursesUseCase.execute({
            search: search as string,
            page: Number(page),
            limit: defaultLimit,
            userId
        });
        return this._httpSuccess.success_200(result.data);
    }

    async getAcademicHistory(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) {
            return this._httpErrors.error_401();
        }
        const { startTerm, endTerm } = httpRequest.query;
        const result = await this._getAcademicHistoryUseCase.execute({
            userId: httpRequest.user.userId,
            startTerm: startTerm ? String(startTerm) : undefined,
            endTerm: endTerm ? String(endTerm) : undefined,
        });
        return this._httpSuccess.success_200(result.data);
    }

    async getProgramInfo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) {
            return this._httpErrors.error_401();
        }
        const result = await this._getProgramInfoUseCase.execute({ userId: httpRequest.user.userId });
        return this._httpSuccess.success_200(result.data);
    }

    async getProgressInfo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) {
            return this._httpErrors.error_401();
        }
        const result = await this._getProgressInfoUseCase.execute({
            userId: httpRequest.user.userId,
        });
        return this._httpSuccess.success_200(result.data);
    }

    async getRequirementsInfo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        if (!httpRequest.user) {
            return this._httpErrors.error_401();
        }
        const result = await this._getRequirementsInfoUseCase.execute({ userId: httpRequest.user.userId });
        return this._httpSuccess.success_200(result.data);
    }

    async registerCourse(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { courseId } = httpRequest.params;
        const { reason } = httpRequest.body;
        if (!httpRequest.user) {
            return this._httpErrors.error_401();
        }
        if (!courseId) {
            throw new InvalidActionError('Course ID is required'); // Using Domain Error instead of direct 400
        }
        if (!reason) {
            throw new InvalidActionError('Reason is required');
        }
        const result = await this._registerCourseUseCase.execute({
            studentId: httpRequest.user.userId,
            courseId,
            reason,
        });
        return this._httpSuccess.success_200(result.data);
    }

    async dropCourse(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { courseId } = httpRequest.params;
        if (!httpRequest.user) {
            return this._httpErrors.error_401();
        }
        if (!courseId) {
            throw new InvalidActionError('Course ID is required');
        }
        const result = await this._dropCourseUseCase.execute({
            studentId: httpRequest.user.userId,
            courseId,
        });
        return this._httpSuccess.success_200(result.data);
    }

    async requestTranscript(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const { deliveryMethod, address, email } = httpRequest.body;
        if (!httpRequest.user) {
            return this._httpErrors.error_401();
        }
        // Validation logic can be moved to a validator or Value Object, but simpler to keep basic checks or throw
        if (!deliveryMethod || !['electronic', 'mail'].includes(deliveryMethod)) {
            throw new InvalidActionError('Invalid delivery method');
        }
        if (deliveryMethod === 'mail' && !address) {
            throw new InvalidActionError('Address is required for mail delivery');
        }
        if (deliveryMethod === 'electronic' && !email) {
            throw new InvalidActionError('Email is required for electronic delivery');
        }
        const result = await this._requestTranscriptUseCase.execute({
            studentId: httpRequest.user.userId,
            deliveryMethod,
            address,
            email,
        });
        return this._httpSuccess.success_200(result.data);
    }
}