import {
  CampusLifeOverviewRequest,
  EventsRequest,
  SportsRequest,
  ClubsRequest,
  JoinClubRequest,
  JoinSportRequest,
  JoinEventRequest,
  RawCampusEvent,
  RawSport,
  RawClub,
  RawJoinRequest,
} from "../../../domain/campus-life/entities/CampusLifeTypes";


export interface ICampusLifeRepository {
  getCampusLifeOverview(params: CampusLifeOverviewRequest): Promise<{ events: RawCampusEvent[]; sports: RawSport[]; clubs: RawClub[] }>;
  getEvents(params: EventsRequest): Promise<{ events: RawCampusEvent[]; requests: RawJoinRequest[]; totalItems: number; totalPages: number; currentPage: number }>;
  getEventById(id: string): Promise<RawCampusEvent | null>;
  getSports(params: SportsRequest): Promise<{ sports: RawSport[]; requests: RawJoinRequest[]; totalItems: number }>;
  getSportById(id: string): Promise<RawSport | null>;
  getClubs(params: ClubsRequest): Promise<{ clubs: RawClub[]; requests: RawJoinRequest[]; totalItems: number }>;
  getClubById(id: string): Promise<RawClub | null>;
  joinClub(params: JoinClubRequest): Promise<RawJoinRequest>;
  joinSport(params: JoinSportRequest): Promise<RawJoinRequest>;
  joinEvent(params: JoinEventRequest): Promise<RawJoinRequest>;
}