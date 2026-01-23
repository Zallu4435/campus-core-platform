import { VideoController } from '../../../presentation/http/video/videoController'; // Path updated
import { VideoRepository } from '../../repositories/video/VideoRepository';
import { IVideoRepository } from '../../../application/video/repositories/IVideoRepository';
import { VideoStorageService } from './VideoStorageService';
import { IVideoStorageService } from '../../../application/video/services/IVideoStorageService';
import {
  IGetVideosUseCase,
  IGetVideoByIdUseCase,
  ICreateVideoUseCase,
  IUpdateVideoUseCase,
  IDeleteVideoUseCase,
} from '../../../application/video/useCases/IVideoUseCases';
import {
  GetVideosUseCase,
  GetVideoByIdUseCase,
  CreateVideoUseCase,
  UpdateVideoUseCase,
  DeleteVideoUseCase
} from '../../../application/video/useCases/VideoUseCases';
import { IVideoController } from '../../../presentation/http/IHttp';

export function getVideoComposer(): IVideoController {
  const repository: IVideoRepository = new VideoRepository();
  const storageService: IVideoStorageService = new VideoStorageService();

  const getVideosUseCase: IGetVideosUseCase = new GetVideosUseCase(repository);
  const getVideoByIdUseCase: IGetVideoByIdUseCase = new GetVideoByIdUseCase(repository);

  // Storage Service Injection
  const createVideoUseCase: ICreateVideoUseCase = new CreateVideoUseCase(repository, storageService);
  const updateVideoUseCase: IUpdateVideoUseCase = new UpdateVideoUseCase(repository, storageService);
  const deleteVideoUseCase: IDeleteVideoUseCase = new DeleteVideoUseCase(repository, storageService);

  return new VideoController(
    getVideosUseCase,
    getVideoByIdUseCase,
    createVideoUseCase,
    updateVideoUseCase,
    deleteVideoUseCase
  );
}
