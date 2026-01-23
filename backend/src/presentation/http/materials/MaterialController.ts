import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IMaterialController } from '../IHttp';
import {
  IGetMaterialByIdUseCase,
  ICreateMaterialUseCase,
  IUpdateMaterialUseCase,
  IDeleteMaterialUseCase,
  IGetMaterialsUseCase
} from '../../../application/materials/useCases/IMaterialUseCases';
import { GetMaterialsRequestDTO } from '../../../application/materials/dtos/MaterialRequestDTOs';

interface UploadedFile {
  fieldname: string;
  path: string;
}

export class MaterialController implements IMaterialController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getMaterialsUseCase: IGetMaterialsUseCase,
    private _getMaterialByIdUseCase: IGetMaterialByIdUseCase,
    private _createMaterialUseCase: ICreateMaterialUseCase,
    private _updateMaterialUseCase: IUpdateMaterialUseCase,
    private _deleteMaterialUseCase: IDeleteMaterialUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getMaterials(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const query = httpRequest.query as unknown as GetMaterialsRequestDTO;
    const response = await this._getMaterialsUseCase.execute(query);
    return this._httpSuccess.success_200(response);
  }

  async getMaterialById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const response = await this._getMaterialByIdUseCase.execute({ id });
    return this._httpSuccess.success_200(response);
  }

  async createMaterial(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { body, files } = httpRequest;

    let file: UploadedFile | undefined, thumbnail: UploadedFile | undefined;
    const fileList = files as UploadedFile[] | { [fieldname: string]: UploadedFile[] };

    if (Array.isArray(fileList)) {
      file = fileList.find((f) => f.fieldname === 'file');
      thumbnail = fileList.find((f) => f.fieldname === 'thumbnail');
    } else if (fileList) {
      file = fileList.file?.[0];
      thumbnail = fileList.thumbnail?.[0];
    }

    if (!file) {
      return this._httpErrors.error_400('Primary file is required');
    }

    const materialData = {
      ...body,
      fileUrl: file.path,
      thumbnailUrl: thumbnail?.path || file.path,
      tags: this._parseTags(body.tags),
      uploadedBy: body.uploadedBy || 'admin'
    };

    const response = await this._createMaterialUseCase.execute(materialData);
    return this._httpSuccess.success_201(response);
  }

  async updateMaterial(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const { body, files } = httpRequest;

    let file: UploadedFile | undefined, thumbnail: UploadedFile | undefined;
    const fileList = files as UploadedFile[] | { [fieldname: string]: UploadedFile[] };

    if (fileList) {
      if (Array.isArray(fileList)) {
        file = fileList.find((f) => f.fieldname === 'file');
        thumbnail = fileList.find((f) => f.fieldname === 'thumbnail');
      } else {
        file = fileList.file?.[0];
        thumbnail = fileList.thumbnail?.[0];
      }
    }

    const updateData = {
      id,
      ...body,
      ...(file && { fileUrl: file.path }),
      ...(thumbnail && { thumbnailUrl: thumbnail.path }),
      ...(body.tags && { tags: this._parseTags(body.tags) })
    };

    const response = await this._updateMaterialUseCase.execute(updateData);
    return this._httpSuccess.success_200(response);
  }

  async deleteMaterial(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    await this._deleteMaterialUseCase.execute({ id });
    return this._httpSuccess.success_200({ message: 'Material deleted successfully' });
  }

  private _parseTags(tags: unknown): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags as string[];
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [tags];
      } catch {
        return tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }
    return [];
  }
}