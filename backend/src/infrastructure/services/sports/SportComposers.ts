import { ISportsRepository } from "../../../application/sports/repositories/ISportsRepository";
import {
  GetSportsUseCase,
  GetSportByIdUseCase,
  CreateSportUseCase,
  UpdateSportUseCase,
  DeleteSportUseCase
} from "../../../application/sports/useCases/SportUseCases";
import {
  IGetSportsUseCase,
  IGetSportByIdUseCase,
  ICreateSportUseCase,
  IUpdateSportUseCase,
  IDeleteSportUseCase
} from "../../../application/sports/useCases/ISportUseCases";
import { SportsController } from "../../../presentation/http/sports/SportsController";
import { SportsRepository } from "../../repositories/sports/SportsRepository";
import { ISportsController } from "../../../presentation/http/IHttp";

export function getSportsComposer(): ISportsController {
  const repository: ISportsRepository = new SportsRepository();
  const getSportsUseCase: IGetSportsUseCase = new GetSportsUseCase(repository);
  const getSportByIdUseCase: IGetSportByIdUseCase = new GetSportByIdUseCase(repository);
  const createSportUseCase: ICreateSportUseCase = new CreateSportUseCase(repository);
  const updateSportUseCase: IUpdateSportUseCase = new UpdateSportUseCase(repository);
  const deleteSportUseCase: IDeleteSportUseCase = new DeleteSportUseCase(repository);

  return new SportsController(
    getSportsUseCase,
    getSportByIdUseCase,
    createSportUseCase,
    updateSportUseCase,
    deleteSportUseCase
  );
} 