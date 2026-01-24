import { ISessionRepository } from '../../../application/session/repositories/ISessionRepository';
import { SessionRepository } from '../../repositories/session/SessionRepository';
import { IAuthRepository } from '../../../application/auth/repositories/IAuthRepository';
import { AuthRepository } from '../../repositories/auth/AuthRepository';
import {
  CreateVideoSessionUseCase,
  JoinVideoSessionUseCase,
  GetVideoSessionUseCase,
  DeleteVideoSessionUseCase,
  UpdateVideoSessionUseCase,
  GetAllVideoSessionsUseCase,
  GetUserSessionsUseCase,
  UpdateVideoSessionStatusUseCase,
  GetSessionAttendanceUseCase,
  UpdateAttendanceStatusUseCase,
  RecordAttendanceJoinUseCase,
  RecordAttendanceLeaveUseCase,
} from '../../../application/session/useCases/VideoSessionUseCases';
import {
  ICreateVideoSessionUseCase,
  IJoinVideoSessionUseCase,
  IGetVideoSessionUseCase,
  IUpdateVideoSessionUseCase,
  IDeleteVideoSessionUseCase,
  IGetAllVideoSessionsUseCase,
  IGetUserSessionsUseCase,
  IUpdateVideoSessionStatusUseCase,
  IGetSessionAttendanceUseCase,
  IUpdateAttendanceStatusUseCase,
  IRecordAttendanceJoinUseCase,
  IRecordAttendanceLeaveUseCase
} from '../../../application/session/useCases/IVideoSessionUseCases';
import { VideoSessionController } from '../../../presentation/http/session/VideoSessionController';
import { IVideoSessionController } from '../../../presentation/http/IHttp';

export function getVideoSessionComposer(): IVideoSessionController {
  const repository: ISessionRepository = new SessionRepository();
  const authRepository: IAuthRepository = new AuthRepository();

  const createUseCase: ICreateVideoSessionUseCase = new CreateVideoSessionUseCase(repository);
  const joinUseCase: IJoinVideoSessionUseCase = new JoinVideoSessionUseCase(repository);
  const getUseCase: IGetVideoSessionUseCase = new GetVideoSessionUseCase(repository);
  const updateUseCase: IUpdateVideoSessionUseCase = new UpdateVideoSessionUseCase(repository);
  const deleteUseCase: IDeleteVideoSessionUseCase = new DeleteVideoSessionUseCase(repository);
  const getAllUseCase: IGetAllVideoSessionsUseCase = new GetAllVideoSessionsUseCase(repository);
  const getUserSessionsUseCase: IGetUserSessionsUseCase = new GetUserSessionsUseCase(repository);
  const updateStatusUseCase: IUpdateVideoSessionStatusUseCase = new UpdateVideoSessionStatusUseCase(repository);
  const getSessionAttendanceUseCase: IGetSessionAttendanceUseCase = new GetSessionAttendanceUseCase(repository, authRepository);
  const updateAttendanceStatusUseCase: IUpdateAttendanceStatusUseCase = new UpdateAttendanceStatusUseCase(repository);
  const recordAttendanceJoinUseCase: IRecordAttendanceJoinUseCase = new RecordAttendanceJoinUseCase(repository);
  const recordAttendanceLeaveUseCase: IRecordAttendanceLeaveUseCase = new RecordAttendanceLeaveUseCase(repository);

  return new VideoSessionController(
    createUseCase,
    joinUseCase,
    getUseCase,
    updateUseCase,
    deleteUseCase,
    getAllUseCase,
    getUserSessionsUseCase,
    updateStatusUseCase,
    getSessionAttendanceUseCase,
    updateAttendanceStatusUseCase,
    recordAttendanceJoinUseCase,
    recordAttendanceLeaveUseCase
  );
} 