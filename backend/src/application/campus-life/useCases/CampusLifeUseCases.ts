import { ICampusLifeRepository } from "../repositories/ICampusLifeRepository";
import { GetCampusLifeOverviewRequestDTO, CampusLifeOverviewResponseDTO } from "../dtos/CampusLifeOverviewDTOs";
import {
  GetEventsRequestDTO,
  GetEventsResponseDTO,
  GetEventByIdRequestDTO,
  GetEventByIdResponseDTO,
  JoinEventRequestDTO,
  JoinEventResponseDTO
} from "../dtos/CampusEventDTOs";
import {
  GetSportsRequestDTO,
  GetSportByIdRequestDTO,
  JoinSportRequestDTO,
} from "../../sports/dtos/SportRequestDTOs";
import {
  GetSportsResponseDTO,
  GetSportByIdResponseDTO,
  JoinSportResponseDTO
} from "../../sports/dtos/SportResponseDTOs";
import {
  GetClubsRequestDTO,
  GetClubsResponseDTO,
  GetClubByIdRequestDTO,
  GetClubByIdResponseDTO,
  JoinClubRequestDTO,
  JoinClubResponseDTO
} from "../dtos/ClubDTOs";
import { ResponseDTO } from "../dtos/ResponseDTO";
import { CampusEvent, Sport as CampusLifeSport, Club } from "../../../domain/campus-life/entities/CampusLife";
import { EventsRequest, SportsRequest, ClubsRequest, JoinClubRequest, JoinSportRequest, JoinEventRequest } from "../../../domain/campus-life/entities/CampusLifeTypes";
import { EventStatus, SportType, ClubStatus, RequestStatus } from "../../../domain/campus-life/enums/CampusLifeEnums";
import { CampusEventMapper } from "../../../infrastructure/repositories/campus-life/mappers/CampusEventMapper";
import { SportMapper } from "../../../infrastructure/repositories/sports/mappers/SportMapper";
import { ClubMapper } from "../../../infrastructure/repositories/campus-life/mappers/ClubMapper";
import { EventNotFoundError, SportNotFoundError, ClubNotFoundError, InvalidJoinRequestError } from "../../../domain/campus-life/errors/CampusLifeErrors";
import { SportStatus } from "../../../domain/sports/entities/SportTypes";
import { RepositorySportData } from "../../sports/dtos/SportBaseDTOs";
import {
  IGetCampusLifeOverviewUseCase,
  IGetEventsUseCase,
  IGetEventByIdUseCase,
  IGetSportsUseCase,
  IGetSportByIdUseCase,
  IGetClubsUseCase,
  IGetClubByIdUseCase,
  IJoinClubUseCase,
  IJoinSportUseCase,
  IJoinEventUseCase
} from "./ICampusLifeUseCases";

interface LegacySportData {
  category?: string;
  organizer?: string;
  organizerType?: string;
  homeGames?: number;
  record?: string;
  upcomingGames?: { date: string; description: string }[];
  status?: string | SportStatus;
}

export class GetCampusLifeOverviewUseCase implements IGetCampusLifeOverviewUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetCampusLifeOverviewRequestDTO): Promise<ResponseDTO<CampusLifeOverviewResponseDTO>> {
    const { events, sports, clubs } = await this._campusLifeRepository.getCampusLifeOverview(params);

    // Explicit mapping to CampusLifeSport domain entities
    const campusLifeSports = SportMapper.toDomainList(sports, [], undefined).map(s => new CampusLifeSport(
      s.id || "",
      s.title,
      s.type as SportType,
      [],
      s.icon,
      s.color,
      s.division,
      s.headCoach,
      [],
      s.record,
      [],
      s.createdAt?.toISOString() || "",
      s.updatedAt?.toISOString() || ""
    ));

    return {
      success: true,
      data: {
        events: CampusEventMapper.toDomainList(events, [], undefined),
        sports: campusLifeSports,
        clubs: ClubMapper.toDomainList(clubs, [], undefined)
      }
    };
  }
}

export class GetEventsUseCase implements IGetEventsUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetEventsRequestDTO): Promise<ResponseDTO<GetEventsResponseDTO>> {
    if (isNaN(params.page) || params.page < 1 || isNaN(params.limit) || params.limit < 1) {
      throw new InvalidJoinRequestError("Invalid page or limit parameters");
    }
    if (params.status && !['upcoming', 'past', 'all'].includes(params.status)) {
      throw new InvalidJoinRequestError("Invalid status; must be 'upcoming', 'past', or 'all'");
    }
    let status: EventStatus | 'all' = 'all';
    if (params.status === 'upcoming') status = EventStatus.Upcoming;
    else if (params.status === 'past') status = EventStatus.Past;
    else status = 'all';

    const eventsRequest = new EventsRequest(
      params.page,
      params.limit,
      params.search,
      status,
      params.userId
    );

    const { events: rawEvents, requests, totalItems, totalPages, currentPage } = await this._campusLifeRepository.getEvents(eventsRequest);
    return {
      success: true,
      data: {
        events: CampusEventMapper.toDomainList(rawEvents, requests, params.userId),
        totalItems,
        totalPages,
        currentPage,
      }
    };
  }
}

export class GetEventByIdUseCase implements IGetEventByIdUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetEventByIdRequestDTO): Promise<ResponseDTO<GetEventByIdResponseDTO>> {
    const rawEvent = await this._campusLifeRepository.getEventById(params.eventId);
    if (!rawEvent) {
      throw new EventNotFoundError(params.eventId);
    }
    return {
      success: true,
      data: {
        event: new CampusEvent(
          rawEvent._id.toString(),
          rawEvent.title,
          rawEvent.date,
          rawEvent.time,
          rawEvent.location,
          rawEvent.organizer,
          rawEvent.timeframe,
          rawEvent.icon,
          rawEvent.color,
          rawEvent.description,
          String(rawEvent.fullTime),
          rawEvent.additionalInfo,
          rawEvent.requirements,
          rawEvent.createdAt.toString(),
          rawEvent.updatedAt.toString()
        )
      }
    };
  }
}

export class GetSportsUseCase implements IGetSportsUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetSportsRequestDTO): Promise<ResponseDTO<GetSportsResponseDTO>> {
    const { sportType: type, search, userId } = params;

    if (type && !['VARSITY SPORTS', 'INTRAMURAL SPORTS'].includes(type)) {
      throw new InvalidJoinRequestError("Invalid type; must be 'VARSITY SPORTS' or 'INTRAMURAL SPORTS'");
    }
    let sportTypeEnum: SportType | undefined = undefined;
    if (type === 'VARSITY SPORTS') sportTypeEnum = SportType.Varsity;
    else if (type === 'INTRAMURAL SPORTS') sportTypeEnum = SportType.Intramural;

    const sportsRequest = new SportsRequest(
      search || "",
      sportTypeEnum,
      userId
    );

    const { sports, requests, totalItems } = await this._campusLifeRepository.getSports(sportsRequest);

    return {
      success: true,
      data: {
        data: SportMapper.toSummaryDTOList(sports as never),
        totalItems,
        totalPages: Math.ceil(totalItems / 10),
        currentPage: 1
      }
    };
  }
}

export class GetSportByIdUseCase implements IGetSportByIdUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetSportByIdRequestDTO): Promise<ResponseDTO<GetSportByIdResponseDTO>> {
    const sportId = params.sportId || params.id;
    const sport = await this._campusLifeRepository.getSportById(sportId);
    if (!sport) {
      throw new SportNotFoundError(sportId);
    }

    const legacyData = sport as unknown as LegacySportData;

    return {
      success: true,
      data: {
        sport: {
          _id: sport._id.toString(),
          title: sport.title,
          type: sport.type,
          headCoach: sport.headCoach,
          status: (legacyData.status || sport.status) as SportStatus,
          division: sport.division,
          participants: sport.participants,
          icon: sport.icon,
          color: sport.color,
          createdAt: sport.createdAt,
          updatedAt: sport.updatedAt,
          category: legacyData.category || "",
          organizer: legacyData.organizer || "",
          organizerType: legacyData.organizerType || "",
          homeGames: legacyData.homeGames || 0,
          record: legacyData.record || "",
          upcomingGames: legacyData.upcomingGames || []
        } as RepositorySportData
      }
    };
  }
}

export class GetClubsUseCase implements IGetClubsUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetClubsRequestDTO): Promise<ResponseDTO<GetClubsResponseDTO>> {
    if (params.status && !['active', 'inactive', 'all'].includes(params.status)) {
      throw new InvalidJoinRequestError("Invalid status; must be 'active', 'inactive', or 'all'");
    }
    let status: ClubStatus | 'all' = 'all';
    if (params.status === 'active') status = ClubStatus.Active;
    else if (params.status === 'inactive') status = ClubStatus.Inactive;
    else status = 'all';

    const clubsRequest = new ClubsRequest(
      params.search,
      status,
      params.type,
      params.userId
    );

    const { clubs, requests, totalItems } = await this._campusLifeRepository.getClubs(clubsRequest);
    return {
      success: true,
      data: {
        clubs: ClubMapper.toDomainList(clubs, requests, params.userId),
        totalItems
      }
    };
  }
}

export class GetClubByIdUseCase implements IGetClubByIdUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetClubByIdRequestDTO): Promise<ResponseDTO<GetClubByIdResponseDTO>> {
    const club = await this._campusLifeRepository.getClubById(params.clubId);
    if (!club) {
      throw new ClubNotFoundError(params.clubId);
    }
    return {
      success: true,
      data: {
        club: new Club(
          club._id.toString(),
          club.name,
          club.type,
          Array.isArray(club.members) ? club.members.length : 0,
          club.icon,
          club.color,
          club.status as ClubStatus,
          "",
          club.nextMeeting,
          club.about || "",
          club.upcomingEvents || [],
          club.createdAt.toString(),
          club.updatedAt.toString()
        )
      }
    };
  }
}

export class JoinClubUseCase implements IJoinClubUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: JoinClubRequestDTO): Promise<ResponseDTO<JoinClubResponseDTO>> {
    if (!params.reason) {
      return { success: false, data: { error: "Reason is required" } };
    }
    const newRequest = await this._campusLifeRepository.joinClub(params);
    return {
      success: true,
      data: {
        requestId: newRequest._id.toString(),
        status: newRequest.status as RequestStatus,
        message: "Join request submitted successfully"
      }
    };
  }
}

export class JoinSportUseCase implements IJoinSportUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: JoinSportRequestDTO): Promise<ResponseDTO<JoinSportResponseDTO>> {
    const reason = params.reason || params.whyJoin;
    if (!reason) {
      return { success: false, data: { error: "Reason is required" } };
    }

    const legacyParams = new JoinSportRequest(
      params.sportId,
      params.studentId || params.userId || "",
      reason,
      params.additionalInfo
    );

    const newRequest = await this._campusLifeRepository.joinSport(legacyParams);
    return {
      success: true,
      data: {
        requestId: newRequest._id.toString(),
        status: newRequest.status as RequestStatus,
        message: "Join request submitted successfully"
      }
    };
  }
}

export class JoinEventUseCase implements IJoinEventUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: JoinEventRequestDTO): Promise<ResponseDTO<JoinEventResponseDTO>> {
    if (!params.reason) {
      return { success: false, data: { error: "Reason is required" } };
    }
    const newRequest = await this._campusLifeRepository.joinEvent(params);
    return {
      success: true,
      data: {
        requestId: newRequest._id.toString(),
        status: newRequest.status as RequestStatus,
        message: "Join request submitted successfully"
      }
    };
  }
}