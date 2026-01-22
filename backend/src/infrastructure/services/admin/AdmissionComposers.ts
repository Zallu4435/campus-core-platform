import { IAdmissionRepository } from '../../../application/admin/repositories/IAdmissionRepository';
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
import { AdminAdmissionController } from '../../../presentation/http/admin/AdmissionController';
import { IAdminAdmissionController } from '../../../presentation/http/IHttp';
import { emailService } from '../../services/email.service';
import { config } from '../../../config/config';
import { AdmissionMapper } from '../../repositories/admin/AdmissionMapper';
import { ServeAdmissionDocumentUseCase } from '../../../application/admin/useCases/ServeAdmissionDocumentUseCase';

export function getAdminAdmissionsComposer(): IAdminAdmissionController {
    const mapper = new AdmissionMapper();
    const repository: IAdmissionRepository = new AdmissionRepository(mapper);

    const getAdmissionsUseCase: IGetAdmissionsUseCase = new GetAdmissionsUseCase(repository, mapper);
    const getAdmissionByIdUseCase: IGetAdmissionByIdUseCase = new GetAdmissionByIdUseCase(repository, mapper);
    const getAdmissionByTokenUseCase: IGetAdmissionByTokenUseCase = new GetAdmissionByTokenUseCase(repository, mapper);
    const approveAdmissionUseCase: IApproveAdmissionUseCase = new ApproveAdmissionUseCase(repository, emailService, config);
    const rejectAdmissionUseCase: IRejectAdmissionUseCase = new RejectAdmissionUseCase(repository);
    const deleteAdmissionUseCase: IDeleteAdmissionUseCase = new DeleteAdmissionUseCase(repository);
    const confirmAdmissionOfferUseCase: IConfirmAdmissionOfferUseCase = new ConfirmAdmissionOfferUseCase(repository);
    const blockAdmissionUseCase: IBlockAdmissionUseCase = new BlockAdmissionUseCase(repository);
    const serveAdmissionDocumentUseCase: IServeAdmissionDocumentUseCase = new ServeAdmissionDocumentUseCase(repository);

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
