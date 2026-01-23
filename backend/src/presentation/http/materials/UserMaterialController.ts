import { IHttpRequest, IHttpResponse, HttpSuccess } from '../IHttp';
import {
  IGetUserMaterialsUseCase,
  IGetUserMaterialByIdUseCase,
  IToggleBookmarkUseCase,
  IToggleLikeUseCase,
  IDownloadMaterialUseCase
} from '../../../application/materials/useCases/IUserMaterialUseCases';
import { GetUserMaterialsRequestDTO } from '../../../application/materials/dtos/UserMaterialRequestDTOs';

export class UserMaterialController {
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getMaterialsUseCase: IGetUserMaterialsUseCase,
    private _getMaterialByIdUseCase: IGetUserMaterialByIdUseCase,
    private _toggleBookmarkUseCase: IToggleBookmarkUseCase,
    private _toggleLikeUseCase: IToggleLikeUseCase,
    private _downloadMaterialUseCase: IDownloadMaterialUseCase
  ) {
    this._httpSuccess = new HttpSuccess();
  }

  async getMaterials(req: IHttpRequest): Promise<IHttpResponse> {
    const { query, user } = req;

    const params: GetUserMaterialsRequestDTO = {
      userId: user!.userId,
      subject: query.subject ? String(query.subject) : undefined,
      course: query.course ? String(query.course) : undefined,
      semester: query.semester ? Number(query.semester) : undefined,
      type: query.type ? String(query.type) : undefined,
      difficulty: query.difficulty ? String(query.difficulty) : undefined,
      search: query.search ? String(query.search) : undefined,
      sortBy: query.sortBy ? String(query.sortBy) : undefined,
      sortOrder: query.sortOrder as 'asc' | 'desc',
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined
    };

    const result = await this._getMaterialsUseCase.execute(params);
    return this._httpSuccess.success_200(result);
  }

  async getMaterialById(req: IHttpRequest): Promise<IHttpResponse> {
    const { id } = req.params;
    const { user } = req;
    const result = await this._getMaterialByIdUseCase.execute({ id, userId: user!.userId });
    return this._httpSuccess.success_200(result);
  }

  async toggleBookmark(req: IHttpRequest): Promise<IHttpResponse> {
    const { id } = req.params;
    const { user } = req;
    await this._toggleBookmarkUseCase.execute({ id, userId: user!.userId });
    return this._httpSuccess.success_200({ message: 'Bookmark toggled' });
  }

  async toggleLike(req: IHttpRequest): Promise<IHttpResponse> {
    const { id } = req.params;
    const { user } = req;
    await this._toggleLikeUseCase.execute({ id, userId: user!.userId });
    return this._httpSuccess.success_200({ message: 'Like toggled' });
  }

  async downloadMaterial(req: IHttpRequest): Promise<IHttpResponse> {
    const { id } = req.params;
    const { user } = req;
    const url = await this._downloadMaterialUseCase.execute({ id, userId: user!.userId });
    return this._httpSuccess.success_200({ url });
  }
}