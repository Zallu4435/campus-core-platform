import { ISportsRepository } from "../../../application/sports/repositories/ISportsRepository";
import {
  GetSportRequestsUseCase,
  ApproveSportRequestUseCase,
  RejectSportRequestUseCase,
  GetSportRequestDetailsUseCase,
  JoinSportUseCase
} from "../../../application/sports/useCases/SportRequestUseCases";
import {
  IGetSportRequestsUseCase,
  IApproveSportRequestUseCase,
  IRejectSportRequestUseCase,
  IGetSportRequestDetailsUseCase,
  IJoinSportUseCase
} from "../../../application/sports/useCases/ISportRequestUseCases";
import { SportRequestController } from "../../../presentation/http/sports/SportRequestController";
import { SportsRepository } from "../../repositories/sports/SportsRepository";
import { ISportRequestController } from "../../../presentation/http/IHttp";

export function getSportRequestsComposer(): ISportRequestController {
  const repository: ISportsRepository = new SportsRepository();
  const getSportRequestsUseCase: IGetSportRequestsUseCase = new GetSportRequestsUseCase(repository);
  const approveSportRequestUseCase: IApproveSportRequestUseCase = new ApproveSportRequestUseCase(repository);
  const rejectSportRequestUseCase: IRejectSportRequestUseCase = new RejectSportRequestUseCase(repository);
  const getSportRequestDetailsUseCase: IGetSportRequestDetailsUseCase = new GetSportRequestDetailsUseCase(repository);
  const joinSportUseCase: IJoinSportUseCase = new JoinSportUseCase(repository);

  return new SportRequestController(
    getSportRequestsUseCase,
    approveSportRequestUseCase,
    rejectSportRequestUseCase,
    getSportRequestDetailsUseCase,
    joinSportUseCase
  );
} 