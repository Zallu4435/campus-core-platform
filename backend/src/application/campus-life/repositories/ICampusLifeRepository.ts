import {
  CampusLifeOverviewRequest,
  EventsRequest,
  EventByIdRequest,
  SportsRequest,
  SportByIdRequest,
  ClubsRequest,
  ClubByIdRequest,
  JoinClubRequest,
  JoinSportRequest,
  JoinEventRequest,
  CampusEventData,
  SportData,
  ClubData,
  JoinRequestData,
} from "../../../domain/campus-life/entities/CampusLifeTypes";

export interface ICampusLifeRepository {
  getCampusLifeOverview(params: CampusLifeOverviewRequest): Promise<{ events: CampusEventData[]; sports: SportData[]; clubs: ClubData[] }>;
  getEvents(params: EventsRequest): Promise<{ events: CampusEventData[]; requests: JoinRequestData[]; totalItems: number; totalPages: number; currentPage: number }>;
  getEventById(id: string): Promise<CampusEventData | null>;
  getSports(params: SportsRequest): Promise<{ sports: SportData[]; requests: JoinRequestData[]; totalItems: number }>;
  getSportById(id: string): Promise<SportData | null>;
  getClubs(params: ClubsRequest): Promise<{ clubs: ClubData[]; requests: JoinRequestData[]; totalItems: number }>;
  getClubById(id: string): Promise<ClubData | null>;
  joinClub(params: JoinClubRequest): Promise<JoinRequestData>;
  joinSport(params: JoinSportRequest): Promise<JoinRequestData>;
  joinEvent(params: JoinEventRequest): Promise<JoinRequestData>;
}