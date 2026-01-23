import { UserMaterialController } from '../../../presentation/http/materials/UserMaterialController';
import { UserMaterialsRepository } from '../../repositories/materials/UserMaterialsRepository';
import { IUserMaterialsRepository } from '../../../application/materials/repositories/IUserMaterialsRepository';
import {
  GetUserMaterialsUseCase,
  GetUserMaterialByIdUseCase,
  ToggleBookmarkUseCase,
  ToggleLikeUseCase,
  DownloadMaterialUseCase,
} from '../../../application/materials/useCases/UserMaterialUseCases';
import {
  IGetUserMaterialsUseCase,
  IGetUserMaterialByIdUseCase,
  IToggleBookmarkUseCase,
  IToggleLikeUseCase,
  IDownloadMaterialUseCase
} from '../../../application/materials/useCases/IUserMaterialUseCases';

export class UserMaterialComposers {
  static composeUserMaterialController() {
    const repository: IUserMaterialsRepository = new UserMaterialsRepository();

    const getMaterialsUseCase: IGetUserMaterialsUseCase = new GetUserMaterialsUseCase(repository);
    const getMaterialByIdUseCase: IGetUserMaterialByIdUseCase = new GetUserMaterialByIdUseCase(repository);
    const toggleBookmarkUseCase: IToggleBookmarkUseCase = new ToggleBookmarkUseCase(repository);
    const toggleLikeUseCase: IToggleLikeUseCase = new ToggleLikeUseCase(repository);
    const downloadMaterialUseCase: IDownloadMaterialUseCase = new DownloadMaterialUseCase(repository);

    return new UserMaterialController(
      getMaterialsUseCase,
      getMaterialByIdUseCase,
      toggleBookmarkUseCase,
      toggleLikeUseCase,
      downloadMaterialUseCase
    );
  }
}