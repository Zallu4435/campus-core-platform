import { IAdmissionRepository } from '../../../application/admin/repositories/IAdmissionRepository';
import { IUserService } from '../../../application/admin/services/IUserService';
import { IProgramService } from '../../../application/admin/services/IProgramService';
import {
    GetAdmissionsUseCase,
    GetAdmissionByIdUseCase,
    GetAdmissionByTokenUseCase,
    ApproveAdmissionUseCase,
    RejectAdmissionUseCase,
    DeleteAdmissionUseCase,
    ConfirmAdmissionOfferUseCase,
    BlockAdmissionUseCase,
} from '../../../application/admin/useCases/AdmissionUseCases';
import {
    IGetAdmissionsUseCase,
    IGetAdmissionByIdUseCase,
    IGetAdmissionByTokenUseCase,
    IApproveAdmissionUseCase,
    IRejectAdmissionUseCase,
    IDeleteAdmissionUseCase,
    IConfirmAdmissionOfferUseCase,
    IBlockAdmissionUseCase,
    IServeAdmissionDocumentUseCase
} from '../../../application/admin/useCases/IAdmissionUseCases';
import { AdmissionRepository } from '../../repositories/admin/AdmissionRepository';
import { UserService } from './UserService';
import { ProgramService } from './ProgramService';
import { AdminAdmissionController } from '../../../presentation/http/admin/AdmissionController';
import { IAdminAdmissionController } from '../../../presentation/http/IHttp';
import { emailService } from '../../services/email.service';
import { config } from '../../../config/config';
import { AdmissionMapper } from '../../repositories/admin/AdmissionMapper';
import { ServeAdmissionDocumentUseCase } from '../../../application/admin/useCases/ServeAdmissionDocumentUseCase';

export function getAdminAdmissionsComposer(): IAdminAdmissionController {
    // Infrastructure dependencies
    const mapper = new AdmissionMapper();
    const repository: IAdmissionRepository = new AdmissionRepository(mapper);
    const userService: IUserService = new UserService();
    const programService: IProgramService = new ProgramService();

    // Use Cases
    const getAdmissionsUseCase: IGetAdmissionsUseCase = new GetAdmissionsUseCase(repository, mapper, userService);
    const getAdmissionByIdUseCase: IGetAdmissionByIdUseCase = new GetAdmissionByIdUseCase(repository, mapper, userService);
    const getAdmissionByTokenUseCase: IGetAdmissionByTokenUseCase = new GetAdmissionByTokenUseCase(repository, mapper);
    const approveAdmissionUseCase: IApproveAdmissionUseCase = new ApproveAdmissionUseCase(repository, emailService, config);
    const rejectAdmissionUseCase: IRejectAdmissionUseCase = new RejectAdmissionUseCase(repository);
    const deleteAdmissionUseCase: IDeleteAdmissionUseCase = new DeleteAdmissionUseCase(repository);
    const confirmAdmissionOfferUseCase: IConfirmAdmissionOfferUseCase = new ConfirmAdmissionOfferUseCase(repository, userService, programService);
    const blockAdmissionUseCase: IBlockAdmissionUseCase = new BlockAdmissionUseCase(repository, userService);
    const serveAdmissionDocumentUseCase: IServeAdmissionDocumentUseCase = new ServeAdmissionDocumentUseCase(repository);

    // Controller
    return new AdminAdmissionController(
        getAdmissionsUseCase,
        getAdmissionByIdUseCase,
        getAdmissionByTokenUseCase,
        approveAdmissionUseCase,
        rejectAdmissionUseCase,
        deleteAdmissionUseCase,
        confirmAdmissionOfferUseCase,
        blockAdmissionUseCase,
        serveAdmissionDocumentUseCase
    );
}
