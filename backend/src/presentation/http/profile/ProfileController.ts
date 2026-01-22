import {
  IGetProfileUseCase,
  IUpdateProfileUseCase,
  IChangePasswordUseCase,
  IUpdateProfilePictureUseCase,
} from '../../../application/profile/useCases/IProfileUseCases';
import {
  GetProfileRequestDTO,
  UpdateProfileRequestDTO,
  ChangePasswordRequestDTO,
  UpdateProfilePictureRequestDTO,
} from '../../../application/profile/dtos/ProfileRequestDTOs';
import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IProfileController } from '../IHttp';

export class ProfileController implements IProfileController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getProfileUseCase: IGetProfileUseCase,
    private _updateProfileUseCase: IUpdateProfileUseCase,
    private _changePasswordUseCase: IChangePasswordUseCase,
    private _updateProfilePictureUseCase: IUpdateProfilePictureUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getProfile(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.userId;
    if (!userId) {
      return this._httpErrors.error_401();
    }

    const dto: GetProfileRequestDTO = { userId };
    const response = await this._getProfileUseCase.execute(dto);
    return this._httpSuccess.success_200(response.data);
  }

  async updateProfile(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.userId;
    if (!userId) {
      return this._httpErrors.error_401();
    }

    const { firstName, lastName, phone, email } = httpRequest.body || {};
    const dto: UpdateProfileRequestDTO = { userId, firstName, lastName, phone, email };
    const response = await this._updateProfileUseCase.execute(dto);
    return this._httpSuccess.success_200(response.data);
  }

  async changePassword(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.userId;
    if (!userId) {
      return this._httpErrors.error_401();
    }

    const { currentPassword, newPassword, confirmPassword } = httpRequest.body || {};
    const dto: ChangePasswordRequestDTO = { userId, currentPassword, newPassword, confirmPassword };
    const response = await this._changePasswordUseCase.execute(dto);
    return this._httpSuccess.success_200(response.data);
  }

  async updateProfilePicture(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.userId;
    const file = httpRequest.file;

    if (!userId) {
      return this._httpErrors.error_401();
    }
    if (!file) {
      return this._httpErrors.error_400('Profile picture file is required');
    }

    const dto: UpdateProfilePictureRequestDTO = { userId, filePath: file.path };
    const response = await this._updateProfilePictureUseCase.execute(dto);
    return this._httpSuccess.success_200({ url: (response.data as { profilePicture: string }).profilePicture });
  }
}