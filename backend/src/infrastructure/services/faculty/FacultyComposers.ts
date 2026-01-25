import { IFacultyRepository } from '../../../application/faculty/repositories/IFacultyRepository';
import {
  GetFacultyUseCase,
  GetFacultyByIdUseCase,
  GetFacultyByTokenUseCase,
  ApproveFacultyUseCase,
  RejectFacultyUseCase,
  DeleteFacultyUseCase,
  ConfirmFacultyOfferUseCase,
  DownloadCertificateUseCase,
  BlockFacultyUseCase,
  ServeDocumentUseCase,
} from '../../../application/faculty/useCases/FacultyUseCases';
import {
  IGetFacultyUseCase,
  IGetFacultyByIdUseCase,
  IGetFacultyByTokenUseCase,
  IApproveFacultyUseCase,
  IRejectFacultyUseCase,
  IDeleteFacultyUseCase,
  IConfirmFacultyOfferUseCase,
  IDownloadCertificateUseCase,
  IBlockFacultyUseCase,
  IServeDocumentUseCase,
} from '../../../application/faculty/useCases/IFacultyUseCases';
import { FacultyRepository } from '../../repositories/faculty/FacultyRepository';
import { storageService } from '../shared/CloudinaryStorageService';
import { FacultyController } from '../../../presentation/http/faculty/FacultyController';
import { IFacultyController } from '../../../presentation/http/IHttp';

export function getFacultyComposer(): IFacultyController {
  const repository: IFacultyRepository = new FacultyRepository();
  const getFacultyUseCase: IGetFacultyUseCase = new GetFacultyUseCase(repository);
  const getFacultyByIdUseCase: IGetFacultyByIdUseCase = new GetFacultyByIdUseCase(repository);
  const getFacultyByTokenUseCase: IGetFacultyByTokenUseCase = new GetFacultyByTokenUseCase(repository);
  const approveFacultyUseCase: IApproveFacultyUseCase = new ApproveFacultyUseCase(repository);
  const rejectFacultyUseCase: IRejectFacultyUseCase = new RejectFacultyUseCase(repository);
  const deleteFacultyUseCase: IDeleteFacultyUseCase = new DeleteFacultyUseCase(repository);
  const confirmFacultyOfferUseCase: IConfirmFacultyOfferUseCase = new ConfirmFacultyOfferUseCase(repository);
  const downloadCertificateUseCase: IDownloadCertificateUseCase = new DownloadCertificateUseCase(repository, storageService);
  const blockFacultyUseCase: IBlockFacultyUseCase = new BlockFacultyUseCase(repository);
  const serveDocumentUseCase: IServeDocumentUseCase = new ServeDocumentUseCase(repository, storageService);
  return new FacultyController(
    getFacultyUseCase,
    getFacultyByIdUseCase,
    getFacultyByTokenUseCase,
    approveFacultyUseCase,
    rejectFacultyUseCase,
    deleteFacultyUseCase,
    confirmFacultyOfferUseCase,
    downloadCertificateUseCase,
    blockFacultyUseCase,
    serveDocumentUseCase
  );
}