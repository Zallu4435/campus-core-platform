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
  IGetAnalyticsUseCase
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
  GetAnalyticsUseCase
} from '../../../application/assignments/useCases/AssignmentUseCases';
import { AssignmentController } from '../../../presentation/http/assignments/AssignmentController';
import { IAssignmentController } from '../../../presentation/http/IHttp';

export function getAssignmentComposer(): IAssignmentController {
  const repository: IAssignmentRepository = new AssignmentRepository();

  /* Storage Service */
  const { storageService } = require('../../shared/CloudinaryStorageService');

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

  return new AssignmentController(
    getAssignmentsUseCase,
    getAssignmentByIdUseCase,
    createAssignmentUseCase,
    updateAssignmentUseCase,
    deleteAssignmentUseCase,
    getSubmissionsUseCase,
    getSubmissionByIdUseCase,
    reviewSubmissionUseCase,
    getAnalyticsUseCase
  );
} 