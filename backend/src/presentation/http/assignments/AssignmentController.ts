import { IHttpRequest, IHttpResponse, IAssignmentController, HttpSuccess, HttpErrors } from '../../http/IHttp';
import {
  IGetAssignmentsUseCase,
  IGetAssignmentByIdUseCase,
  ICreateAssignmentUseCase,
  IUpdateAssignmentUseCase,
  IDeleteAssignmentUseCase,
  IGetSubmissionsUseCase,
  IGetSubmissionByIdUseCase,
  IReviewSubmissionUseCase,
  IGetAnalyticsUseCase,
  IServeAssignmentFileUseCase
} from "../../../application/assignments/useCases/IAssignmentUseCases";
import { AssignmentStatus, SubmissionStatus } from '../../../domain/assignments/enums/AssignmentEnums';
import { FileDTO } from '../../../application/assignments/dtos/AssignmentDTOs';

export class AssignmentController implements IAssignmentController {
  private _httpSuccess: HttpSuccess;
  private _httpErrors: HttpErrors;

  constructor(
    private _getAssignmentsUseCase: IGetAssignmentsUseCase,
    private _getAssignmentByIdUseCase: IGetAssignmentByIdUseCase,
    private _createAssignmentUseCase: ICreateAssignmentUseCase,
    private _updateAssignmentUseCase: IUpdateAssignmentUseCase,
    private _deleteAssignmentUseCase: IDeleteAssignmentUseCase,
    private _getSubmissionsUseCase: IGetSubmissionsUseCase,
    private _getSubmissionByIdUseCase: IGetSubmissionByIdUseCase,
    private _reviewSubmissionUseCase: IReviewSubmissionUseCase,
    private _getAnalyticsUseCase: IGetAnalyticsUseCase,
    private _serveAssignmentFileUseCase: IServeAssignmentFileUseCase
  ) {
    this._httpSuccess = new HttpSuccess();
    this._httpErrors = new HttpErrors();
  }

  private _mapFiles(files?: Express.Multer.File[]): FileDTO[] | undefined {
    if (!files || files.length === 0) return undefined;
    return files.map(f => ({
      originalname: f.originalname,
      path: f.path,
      size: f.size
    }));
  }

  async getAssignments(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { subject, status, page, limit, search } = httpRequest.query;
    const data = await this._getAssignmentsUseCase.execute({
      subject: subject as string,
      status: status as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
    });
    return this._httpSuccess.success_200(data);
  }

  async getAssignmentById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const data = await this._getAssignmentByIdUseCase.execute({ id });
    return this._httpSuccess.success_200(data);
  }

  async createAssignment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const data = await this._createAssignmentUseCase.execute({
      title: httpRequest.body.title,
      subject: httpRequest.body.subject,
      description: httpRequest.body.description,
      maxMarks: Number(httpRequest.body.maxMarks),
      dueDate: new Date(httpRequest.body.dueDate),
      files: this._mapFiles(httpRequest.files)
    });
    return this._httpSuccess.success_201(data);
  }

  async updateAssignment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const data = await this._updateAssignmentUseCase.execute({
      id,
      title: httpRequest.body.title,
      subject: httpRequest.body.subject,
      description: httpRequest.body.description,
      maxMarks: httpRequest.body.maxMarks ? Number(httpRequest.body.maxMarks) : undefined,
      dueDate: httpRequest.body.dueDate ? new Date(httpRequest.body.dueDate) : undefined,
      files: this._mapFiles(httpRequest.files),
      status: httpRequest.body.status as AssignmentStatus
    });
    return this._httpSuccess.success_200(data);
  }

  async deleteAssignment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const data = await this._deleteAssignmentUseCase.execute({ id });
    return this._httpSuccess.success_200(data);
  }

  async getSubmissions(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { assignmentId } = httpRequest.params;
    const { page, limit, search, status } = httpRequest.query;

    const data = await this._getSubmissionsUseCase.execute({
      assignmentId,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      status: status as string
    });
    return this._httpSuccess.success_200(data);
  }

  async getSubmissionById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { assignmentId, submissionId } = httpRequest.params;
    const data = await this._getSubmissionByIdUseCase.execute({
      assignmentId,
      submissionId
    });
    return this._httpSuccess.success_200(data);
  }

  async reviewSubmission(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { assignmentId, submissionId } = httpRequest.params;
    const { marks, feedback, status, isLate } = httpRequest.body;

    const data = await this._reviewSubmissionUseCase.execute({
      assignmentId,
      submissionId,
      marks: Number(marks),
      feedback,
      status: status as SubmissionStatus,
      isLate: isLate === true || isLate === 'true'
    });
    return this._httpSuccess.success_200(data);
  }

  async getAnalytics(_httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const data = await this._getAnalyticsUseCase.execute();
    return this._httpSuccess.success_200(data);
  }

  async serveFile(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const { fileName } = httpRequest.query;
    if (!id || !fileName) {
      return this._httpErrors.error_400('Assignment ID and file name are required');
    }
    const data = await this._serveAssignmentFileUseCase.execute({
      assignmentId: id,
      fileName: fileName as string
    });
    return this._httpSuccess.success_200(data);
  }
}
