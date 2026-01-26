import { IAssignmentRepository } from '../../../application/assignments/repositories/IAssignmentRepository';
import { AssignmentRepository } from '../../repositories/assignments/AssignmentRepository';
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
} from '../../../application/assignments/useCases/IAssignmentUseCases';
import {
  GetAssignmentsUseCase,
  GetAssignmentByIdUseCase,
  CreateAssignmentUseCase,
  UpdateAssignmentUseCase,
  DeleteAssignmentUseCase,
  GetSubmissionsUseCase,
  GetSubmissionByIdUseCase,
  ReviewSubmissionUseCase,
  GetAnalyticsUseCase,
  ServeAssignmentFileUseCase
} from '../../../application/assignments/useCases/AssignmentUseCases';
import { AssignmentController } from '../../../presentation/http/assignments/AssignmentController';
import { IAssignmentController } from '../../../presentation/http/IHttp';
import { storageService } from '../shared/CloudinaryStorageService';

export function getAssignmentComposer(): IAssignmentController {
  const repository: IAssignmentRepository = new AssignmentRepository();

  const getAssignmentsUseCase: IGetAssignmentsUseCase = new GetAssignmentsUseCase(repository);
  const getAssignmentByIdUseCase: IGetAssignmentByIdUseCase = new GetAssignmentByIdUseCase(repository);

  /* Injected Storage Service for Cleanup */
  const createAssignmentUseCase: ICreateAssignmentUseCase = new CreateAssignmentUseCase(repository, storageService);
  const updateAssignmentUseCase: IUpdateAssignmentUseCase = new UpdateAssignmentUseCase(repository, storageService);
  const deleteAssignmentUseCase: IDeleteAssignmentUseCase = new DeleteAssignmentUseCase(repository, storageService);

  const getSubmissionsUseCase: IGetSubmissionsUseCase = new GetSubmissionsUseCase(repository);
  const getSubmissionByIdUseCase: IGetSubmissionByIdUseCase = new GetSubmissionByIdUseCase(repository);
  const reviewSubmissionUseCase: IReviewSubmissionUseCase = new ReviewSubmissionUseCase(repository);
  const getAnalyticsUseCase: IGetAnalyticsUseCase = new GetAnalyticsUseCase(repository);
  const serveAssignmentFileUseCase: IServeAssignmentFileUseCase = new ServeAssignmentFileUseCase(repository, storageService);

  return new AssignmentController(
    getAssignmentsUseCase,
    getAssignmentByIdUseCase,
    createAssignmentUseCase,
    updateAssignmentUseCase,
    deleteAssignmentUseCase,
    getSubmissionsUseCase,
    getSubmissionByIdUseCase,
    reviewSubmissionUseCase,
    getAnalyticsUseCase,
    serveAssignmentFileUseCase
  );
} 