import { MaterialsRepository } from '../../repositories/materials/MaterialsRepository';
import { GetMaterialsUseCase, GetMaterialByIdUseCase, CreateMaterialUseCase, UpdateMaterialUseCase, DeleteMaterialUseCase } from '../../../application/materials/useCases/MaterialUseCases';
import { IGetMaterialsUseCase, IGetMaterialByIdUseCase, ICreateMaterialUseCase, IUpdateMaterialUseCase, IDeleteMaterialUseCase } from '../../../application/materials/useCases/IMaterialUseCases';
import { MaterialController } from '../../../presentation/http/materials/MaterialController';
import { storageService } from '../shared/CloudinaryStorageService';

export class MaterialComposers {
  static composeMaterialController(): MaterialController {
    const repository = new MaterialsRepository();
    // Use the singleton storage service exported from CloudinaryStorageService

    const getMaterialsUseCase: IGetMaterialsUseCase = new GetMaterialsUseCase(repository);
    const getMaterialByIdUseCase: IGetMaterialByIdUseCase = new GetMaterialByIdUseCase(repository);

    // Inject storage service (Note: UseCases constructor signature must be updated next)
    const createMaterialUseCase: ICreateMaterialUseCase = new CreateMaterialUseCase(repository, storageService);
    const updateMaterialUseCase: IUpdateMaterialUseCase = new UpdateMaterialUseCase(repository, storageService);
    const deleteMaterialUseCase: IDeleteMaterialUseCase = new DeleteMaterialUseCase(repository, storageService);

    return new MaterialController(
      getMaterialsUseCase,
      getMaterialByIdUseCase,
      createMaterialUseCase,
      updateMaterialUseCase,
      deleteMaterialUseCase
    );
  }
} 