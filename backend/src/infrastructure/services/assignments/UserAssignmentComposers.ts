import { IUserAssignmentRepository } from '../../../application/assignments/repositories/IUserAssignmentRepository';
import { UserAssignmentRepository } from '../../repositories/assignments/UserAssignmentRepository';
import {
  GetUserAssignmentsUseCase,
  GetUserAssignmentByIdUseCase,
  SubmitUserAssignmentUseCase,
  GetUserAssignmentStatusUseCase,
  GetUserAssignmentFeedbackUseCase
} from '../../../application/assignments/useCases/UserAssignmentUseCases';
import {
  IGetUserAssignmentsUseCase,
  IGetUserAssignmentByIdUseCase,
  ISubmitUserAssignmentUseCase,
  IGetUserAssignmentStatusUseCase,
  IGetUserAssignmentFeedbackUseCase
} from '../../../application/assignments/useCases/IUserAssignmentUseCases';
import { UserAssignmentController } from '../../../presentation/http/assignments/UserAssignmentController';
import { IUserAssignmentController } from '../../../presentation/http/IHttp';

export function getUserAssignmentComposer(): IUserAssignmentController {
  const repository: IUserAssignmentRepository = new UserAssignmentRepository();

  /* Storage Service */
  const { storageService } = require('../../shared/CloudinaryStorageService');

  const getUserAssignmentsUseCase: IGetUserAssignmentsUseCase = new GetUserAssignmentsUseCase(repository);
  const getUserAssignmentByIdUseCase: IGetUserAssignmentByIdUseCase = new GetUserAssignmentByIdUseCase(repository);

  /* Injected Storage Service for Cleanup */
  const submitUserAssignmentUseCase: ISubmitUserAssignmentUseCase = new SubmitUserAssignmentUseCase(repository, storageService);

  const getUserAssignmentStatusUseCase: IGetUserAssignmentStatusUseCase = new GetUserAssignmentStatusUseCase(repository);
  const getUserAssignmentFeedbackUseCase: IGetUserAssignmentFeedbackUseCase = new GetUserAssignmentFeedbackUseCase(repository);

  return new UserAssignmentController(
    getUserAssignmentsUseCase,
    getUserAssignmentByIdUseCase,
    submitUserAssignmentUseCase,
    getUserAssignmentStatusUseCase,
    getUserAssignmentFeedbackUseCase
  );
} 