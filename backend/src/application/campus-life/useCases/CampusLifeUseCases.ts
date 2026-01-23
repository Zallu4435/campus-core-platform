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
  GetSportsResponseDTO,
  GetSportByIdRequestDTO,
  GetSportByIdResponseDTO,
  JoinSportRequestDTO,
  JoinSportResponseDTO
} from "../dtos/SportDTOs";
import {
  GetClubsRequestDTO,
  GetClubsResponseDTO,
  GetClubByIdRequestDTO,
  GetClubByIdResponseDTO,
  JoinClubRequestDTO,
  JoinClubResponseDTO
} from "../dtos/ClubDTOs";
import { ResponseDTO } from "../dtos/ResponseDTO";
import { CampusEvent, Sport, Club } from "../../../domain/campus-life/entities/CampusLife";
import { EventsRequest, SportsRequest, ClubsRequest, JoinClubRequest, JoinSportRequest, JoinEventRequest } from "../../../domain/campus-life/entities/CampusLifeTypes";
import { EventStatus, SportType, ClubStatus, RequestStatus } from "../../../domain/campus-life/enums/CampusLifeEnums";
import { CampusEventMapper } from "../../../infrastructure/repositories/campus-life/mappers/CampusEventMapper";
import { SportMapper } from "../../../infrastructure/repositories/campus-life/mappers/SportMapper";
import { ClubMapper } from "../../../infrastructure/repositories/campus-life/mappers/ClubMapper";
import { EventNotFoundError, SportNotFoundError, ClubNotFoundError, InvalidJoinRequestError } from "../../../domain/campus-life/errors/CampusLifeErrors";
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



export class GetCampusLifeOverviewUseCase implements IGetCampusLifeOverviewUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetCampusLifeOverviewRequestDTO): Promise<ResponseDTO<CampusLifeOverviewResponseDTO>> {
    const { events, sports, clubs } = await this._campusLifeRepository.getCampusLifeOverview(params);
    return {
      success: true,
      data: {
        events: CampusEventMapper.toDomainList(events, [], undefined),
        sports: SportMapper.toDomainList(sports, [], undefined),
        clubs: ClubMapper.toDomainList(clubs, [], undefined)
      }
    };
  }
}

export class GetEventsUseCase implements IGetEventsUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetEventsRequestDTO): Promise<ResponseDTO<GetEventsResponseDTO>> {
    // Validation is now handled by middleware, these checks are redundant but kept for safety
    if (isNaN(params.page) || params.page < 1 || isNaN(params.limit) || params.limit < 1) {
      throw new InvalidJoinRequestError("Invalid page or limit parameters");
    }
    if (params.status && !['upcoming', 'past', 'all'].includes(params.status)) {
      throw new InvalidJoinRequestError("Invalid status; must be 'upcoming', 'past', or 'all'");
    }
    // Convert DTO status string to EventStatus enum or 'all'
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
    if (params.type && !['VARSITY SPORTS', 'INTRAMURAL SPORTS'].includes(params.type)) {
      throw new InvalidJoinRequestError("Invalid type; must be 'VARSITY SPORTS' or 'INTRAMURAL SPORTS'");
    }
    // Convert DTO type string to SportType enum if provided
    let type: SportType | undefined = undefined;
    if (params.type === 'VARSITY SPORTS') type = SportType.Varsity;
    else if (params.type === 'INTRAMURAL SPORTS') type = SportType.Intramural;

    const sportsRequest = new SportsRequest(
      params.search,
      type,
      params.userId
    );

    const { sports, requests, totalItems } = await this._campusLifeRepository.getSports(sportsRequest);
    return {
      success: true,
      data: {
        sports: SportMapper.toDomainList(sports, requests, params.userId),
        totalItems
      }
    };
  }
}

export class GetSportByIdUseCase implements IGetSportByIdUseCase {
  constructor(private readonly _campusLifeRepository: ICampusLifeRepository) { }

  async execute(params: GetSportByIdRequestDTO): Promise<ResponseDTO<GetSportByIdResponseDTO>> {
    const sport = await this._campusLifeRepository.getSportById(params.sportId);
    if (!sport) {
      throw new SportNotFoundError(params.sportId);
    }
    return {
      success: true,
      data: {
        sport: new Sport(
          sport._id.toString(),
          sport.title,
          sport.type as SportType,
          [],
          sport.icon,
          sport.color,
          sport.division,
          sport.headCoach,
          [],
          "",
          [],
          sport.createdAt.toString(),
          sport.updatedAt.toString()
        )
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
    // Convert DTO status string to ClubStatus enum or 'all'
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
    if (!params.reason) {
      return { success: false, data: { error: "Reason is required" } };
    }
    const newRequest = await this._campusLifeRepository.joinSport(params);
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