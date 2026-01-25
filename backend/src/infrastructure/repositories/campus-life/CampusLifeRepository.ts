import { ICampusLifeRepository } from "../../../application/campus-life/repositories/ICampusLifeRepository";
import { CampusEventModel, EventRequestModel } from "../../../infrastructure/database/mongoose/events/CampusEventModel";
import { TeamModel, SportRequestModel } from "../../database/mongoose/sport/sports.model";
import { ClubModel, ClubRequestModel } from "../../database/mongoose/clubs/ClubModel";
import {
  CampusEventFilter,
  CampusLifeOverviewRequest,
  ClubFilter,
  ClubsRequest,
  EventsRequest,
  JoinClubRequest,
  JoinEventRequest,
  JoinSportRequest,
  CampusEventData,
  ClubData,
  SportData,
  SportFilter,
  SportsRequest,
  JoinRequestData
} from "../../../domain/campus-life/entities/CampusLifeTypes";
import { RequestStatus } from "../../../domain/campus-life/enums/CampusLifeEnums";
import { ICampusEventSource, IClubSource, IJoinRequestSource, ITeamSource } from "./infraTypes";
import { CAMPUS_LIFE_CONSTANTS } from "../../../application/campus-life/constants/CampusLifeConstants";

export class CampusLifeRepository implements ICampusLifeRepository {

  private mapRawToData<T extends { _id: any }>(raw: T): Omit<T, '_id'> & { id: string } {
    const { _id, ...rest } = raw;
    return { id: _id.toString(), ...rest };
  }

  private mapEventFilter(filter: CampusEventFilter): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (filter.searchQuery) {
      query.title = { $regex: filter.searchQuery, $options: 'i' };
    }
    if (filter.status && filter.status !== 'all') {
      const today = new Date().toISOString().split("T")[0];
      query.date = filter.status === "upcoming" ? { $gte: today } : { $lte: today };
    }
    if (filter.organizer) {
      query.organizer = { $regex: filter.organizer, $options: 'i' };
    }
    return query;
  }

  private mapSportFilter(filter: SportFilter): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (filter.type) {
      query.type = filter.type;
    }
    if (filter.searchQuery) {
      query.title = { $regex: filter.searchQuery, $options: 'i' };
    }
    if (filter.division) {
      query.division = filter.division;
    }
    if (filter.headCoach) {
      query.headCoach = { $regex: filter.headCoach, $options: 'i' };
    }
    return query;
  }

  private mapClubFilter(filter: ClubFilter): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (filter.searchQuery) {
      query.name = { $regex: filter.searchQuery, $options: 'i' };
    }
    if (filter.type) {
      query.type = { $regex: filter.type, $options: 'i' };
    }
    if (filter.status && filter.status !== 'all') {
      query.status = filter.status;
    }
    return query;
  }

  async getCampusLifeOverview(params: CampusLifeOverviewRequest) {
    const eventsRaw = await CampusEventModel.find()
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.EVENT_SELECT)
      .limit(CAMPUS_LIFE_CONSTANTS.PAGINATION.OVERVIEW_LIMIT)
      .lean<ICampusEventSource[]>();

    const sportsRaw = await TeamModel.find()
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.SPORT_SELECT)
      .limit(CAMPUS_LIFE_CONSTANTS.PAGINATION.OVERVIEW_LIMIT)
      .lean<ITeamSource[]>();

    const clubsRaw = await ClubModel.find()
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.CLUB_SELECT)
      .limit(CAMPUS_LIFE_CONSTANTS.PAGINATION.OVERVIEW_LIMIT)
      .lean<IClubSource[]>();

    return {
      events: eventsRaw.map(e => this.mapRawToData(e) as unknown as CampusEventData),
      sports: sportsRaw.map(s => this.mapRawToData(s) as unknown as SportData),
      clubs: clubsRaw.map(c => this.mapRawToData(c) as unknown as ClubData)
    };
  }

  async getEvents(params: EventsRequest) {
    const filter: CampusEventFilter = {
      searchQuery: params.search,
      status: params.status
    };
    const query = this.mapEventFilter(filter);
    const skip = CAMPUS_LIFE_CONSTANTS.PAGINATION.calculateSkip(params.page, params.limit);
    const totalItems = await CampusEventModel.countDocuments(query);
    const totalPages = CAMPUS_LIFE_CONSTANTS.PAGINATION.calculateTotalPages(totalItems, params.limit);
    const currentPage = params.page;

    const eventsRaw = await CampusEventModel.find(query)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.EVENT_SELECT)
      .skip(skip)
      .limit(params.limit)
      .lean<ICampusEventSource[]>();

    const events = eventsRaw.map(e => this.mapRawToData(e) as unknown as CampusEventData);

    let requests: JoinRequestData[] = [];
    if (params.userId) {
      const requestsRaw = await EventRequestModel.find({ userId: params.userId }).lean<IJoinRequestSource[]>();
      requests = requestsRaw.map(r => this.mapRawToData(r) as unknown as JoinRequestData);
    }

    return { events, requests, totalItems, totalPages, currentPage };
  }

  async getEventById(id: string): Promise<CampusEventData | null> {
    const raw = await CampusEventModel.findById(id)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.EVENT_SELECT)
      .lean<ICampusEventSource | null>();
    return raw ? this.mapRawToData(raw) as unknown as CampusEventData : null;
  }

  async getSports(params: SportsRequest) {
    const filter: SportFilter = {
      searchQuery: params.search,
      type: params.type
    };
    const query = this.mapSportFilter(filter);

    const totalItems = await TeamModel.countDocuments(query);
    const sportsRaw = await TeamModel.find(query)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.SPORT_SELECT)
      .lean<ITeamSource[]>();

    const sports = sportsRaw.map(s => this.mapRawToData(s) as unknown as SportData);

    let requests: JoinRequestData[] = [];
    if (params.userId) {
      const requestsRaw = await SportRequestModel.find({ userId: params.userId }).lean<IJoinRequestSource[]>();
      requests = requestsRaw.map(r => this.mapRawToData(r) as unknown as JoinRequestData);
    }
    return { sports, requests, totalItems };
  }

  async getSportById(id: string): Promise<SportData | null> {
    const raw = await TeamModel.findById(id)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.SPORT_SELECT)
      .lean<ITeamSource | null>();
    return raw ? this.mapRawToData(raw) as unknown as SportData : null;
  }

  async getClubs(params: ClubsRequest) {
    const filter: ClubFilter = {
      searchQuery: params.search,
      type: params.type,
      status: params.status
    };
    const query = this.mapClubFilter(filter);

    const clubsRaw = await ClubModel.find(query)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.CLUB_SELECT)
      .limit(CAMPUS_LIFE_CONSTANTS.PAGINATION.CLUBS_DEFAULT_LIMIT)
      .lean<IClubSource[]>();

    const clubs = clubsRaw.map(c => this.mapRawToData(c) as unknown as ClubData);
    const totalItems = await ClubModel.countDocuments(query);

    let requests: JoinRequestData[] = [];
    if (params.userId) {
      const requestsRaw = await ClubRequestModel.find({ userId: params.userId }).lean<IJoinRequestSource[]>();
      requests = requestsRaw.map(r => this.mapRawToData(r) as unknown as JoinRequestData);
    }
    return { clubs, requests, totalItems };
  }

  async getClubById(id: string): Promise<ClubData | null> {
    const raw = await ClubModel.findById(id)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.CLUB_SELECT)
      .lean<IClubSource | null>();
    return raw ? this.mapRawToData(raw) as unknown as ClubData : null;
  }

  async joinClub(params: JoinClubRequest): Promise<JoinRequestData> {
    const newRequest = new ClubRequestModel({
      clubId: params.clubId,
      userId: params.studentId,
      status: RequestStatus.Pending,
      whyJoin: params.reason,
      additionalInfo: params.additionalInfo || "",
      createdAt: new Date(),
    });
    await newRequest.save();
    return this.mapRawToData(newRequest.toObject()) as unknown as JoinRequestData;
  }

  async joinSport(params: JoinSportRequest): Promise<JoinRequestData> {
    const newRequest = new SportRequestModel({
      sportId: params.sportId,
      userId: params.studentId,
      status: RequestStatus.Pending,
      whyJoin: params.reason,
      additionalInfo: params.additionalInfo || "",
      createdAt: new Date(),
    });
    await newRequest.save();
    return this.mapRawToData(newRequest.toObject()) as unknown as JoinRequestData;
  }

  async joinEvent(params: JoinEventRequest): Promise<JoinRequestData> {
    const newRequest = new EventRequestModel({
      eventId: params.eventId,
      userId: params.studentId,
      status: RequestStatus.Pending,
      whyJoin: params.reason,
      additionalInfo: params.additionalInfo || "",
      createdAt: new Date(),
    });
    await newRequest.save();
    return this.mapRawToData(newRequest.toObject()) as unknown as JoinRequestData;
  }
}