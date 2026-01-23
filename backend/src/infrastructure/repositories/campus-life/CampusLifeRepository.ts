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
  RawCampusEvent,
  RawClub,
  RawSport,
  SportFilter,
  SportsRequest,
  RawJoinRequest
} from "../../../domain/campus-life/entities/CampusLifeTypes";
import { RequestStatus } from "../../../domain/campus-life/enums/CampusLifeEnums";
import { CAMPUS_LIFE_CONSTANTS } from "../../../application/campus-life/constants/CampusLifeConstants";

export class CampusLifeRepository implements ICampusLifeRepository {
  async findEvents(query: CampusEventFilter, skip: number, limit: number) {
    return CampusEventModel.find(query)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.EVENT_SELECT)
      .skip(skip)
      .limit(limit)
      .lean<RawCampusEvent[]>();
  }

  async findEventById(eventId: string) {
    return CampusEventModel.findById(eventId)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.EVENT_SELECT)
      .lean<RawCampusEvent | null>();
  }

  async findSports(query: SportFilter) {
    return TeamModel.find(query)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.SPORT_SELECT)
      .lean<RawSport[]>();
  }

  async findSportById(sportId: string) {
    return TeamModel.findById(sportId)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.SPORT_SELECT)
      .lean<RawSport | null>();
  }

  async findClubs(query: ClubFilter) {
    return ClubModel.find(query)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.CLUB_SELECT)
      .lean<RawClub[]>();
  }

  async findClubById(clubId: string) {
    return ClubModel.findById(clubId)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.CLUB_SELECT)
      .lean<RawClub | null>();
  }

  async findEventRequestsByUser(userId: string) {
    return EventRequestModel.find({ userId }).lean<RawJoinRequest[]>();
  }

  async findSportRequestsByUser(userId: string) {
    return SportRequestModel.find({ userId }).lean<RawJoinRequest[]>();
  }

  async findClubRequestsByUser(userId: string) {
    return ClubRequestModel.find({ userId }).lean<RawJoinRequest[]>();
  }

  async countEvents(query: CampusEventFilter) {
    return CampusEventModel.countDocuments(query);
  }

  async countSports(query: SportFilter) {
    return TeamModel.countDocuments(query);
  }

  async countClubs(query: ClubFilter) {
    return ClubModel.countDocuments(query);
  }

  async getCampusLifeOverview(params: CampusLifeOverviewRequest) {
    const events = await CampusEventModel.find()
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.EVENT_SELECT)
      .limit(CAMPUS_LIFE_CONSTANTS.PAGINATION.OVERVIEW_LIMIT)
      .lean<RawCampusEvent[]>();

    const sports = await TeamModel.find()
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.SPORT_SELECT)
      .limit(CAMPUS_LIFE_CONSTANTS.PAGINATION.OVERVIEW_LIMIT)
      .lean<RawSport[]>();

    const clubs = await ClubModel.find()
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.CLUB_SELECT)
      .limit(CAMPUS_LIFE_CONSTANTS.PAGINATION.OVERVIEW_LIMIT)
      .lean<RawClub[]>();

    return { events, sports, clubs };
  }

  async getEvents(params: EventsRequest) {
    const query: CampusEventFilter = {};
    const hasFilter = !!(params.search || (params.status && params.status !== CAMPUS_LIFE_CONSTANTS.QUERY.STATUS_ALL));
    if (params.search) {
      query.title = { $regex: params.search, $options: CAMPUS_LIFE_CONSTANTS.QUERY.CASE_INSENSITIVE };
    }
    if (params.status && params.status !== CAMPUS_LIFE_CONSTANTS.QUERY.STATUS_ALL) {
      const today = new Date().toISOString().split("T")[0];
      query.date = params.status === "upcoming" ? { $gte: today } : { $lte: today };
    }

    const skip = CAMPUS_LIFE_CONSTANTS.PAGINATION.calculateSkip(params.page, params.limit);
    const totalItems = await this.countEvents(query);
    const totalPages = CAMPUS_LIFE_CONSTANTS.PAGINATION.calculateTotalPages(totalItems, params.limit);
    const currentPage = params.page;

    let events: RawCampusEvent[];
    if (!hasFilter) {
      events = await CampusEventModel.find()
        .select(CAMPUS_LIFE_CONSTANTS.FIELDS.EVENT_SELECT)
        .skip(skip)
        .limit(params.limit)
        .lean<RawCampusEvent[]>();
    } else {
      events = await this.findEvents(query, skip, params.limit);
    }

    let requests: RawJoinRequest[] = [];
    if (params.userId) {
      requests = await this.findEventRequestsByUser(params.userId);
    }
    return { events, requests, totalItems, totalPages, currentPage };
  }

  async getEventById(id: string) {
    return await this.findEventById(id);
  }

  async getSports(params: SportsRequest) {
    const query: SportFilter = {};
    if (params.type) {
      query.type = params.type;
    }
    if (params.search) {
      query.title = { $regex: params.search, $options: CAMPUS_LIFE_CONSTANTS.QUERY.CASE_INSENSITIVE };
    }
    const totalItems = await this.countSports(query);
    const sports = await TeamModel.find(query)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.SPORT_SELECT)
      .lean<RawSport[]>();
    let requests: RawJoinRequest[] = [];
    if (params.userId) {
      requests = await this.findSportRequestsByUser(params.userId);
    }
    return { sports, requests, totalItems };
  }

  async getSportById(id: string) {
    return await TeamModel.findById(id)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.SPORT_SELECT)
      .lean<RawSport | null>();
  }

  async getClubs(params: ClubsRequest) {
    const query: ClubFilter = {};
    const hasFilter = !!(params.search || params.type || (params.status && params.status !== CAMPUS_LIFE_CONSTANTS.QUERY.STATUS_ALL));
    if (params.search) {
      query.name = { $regex: params.search, $options: CAMPUS_LIFE_CONSTANTS.QUERY.CASE_INSENSITIVE };
    }
    if (params.type) {
      query.type = { $regex: params.type, $options: CAMPUS_LIFE_CONSTANTS.QUERY.CASE_INSENSITIVE };
    }
    if (params.status && params.status !== CAMPUS_LIFE_CONSTANTS.QUERY.STATUS_ALL) {
      query.status = params.status;
    }
    let clubs: RawClub[];
    if (!hasFilter) {
      clubs = await ClubModel.find()
        .select(CAMPUS_LIFE_CONSTANTS.FIELDS.CLUB_SELECT)
        .limit(CAMPUS_LIFE_CONSTANTS.PAGINATION.CLUBS_DEFAULT_LIMIT)
        .lean<RawClub[]>();
    } else {
      clubs = await this.findClubs(query);
    }
    const totalItems = await this.countClubs(query);
    let requests: RawJoinRequest[] = [];
    if (params.userId) {
      requests = await this.findClubRequestsByUser(params.userId);
    }
    return { clubs, requests, totalItems };
  }

  async getClubById(id: string) {
    return await ClubModel.findById(id)
      .select(CAMPUS_LIFE_CONSTANTS.FIELDS.CLUB_SELECT)
      .lean<RawClub | null>();
  }

  async joinClub(params: JoinClubRequest) {
    const newRequest = new ClubRequestModel({
      clubId: params.clubId,
      userId: params.studentId,
      status: RequestStatus.Pending,
      whyJoin: params.reason,
      additionalInfo: params.additionalInfo || "",
      createdAt: new Date(),
    });
    await newRequest.save();
    return newRequest.toObject() as RawJoinRequest;
  }

  async joinSport(params: JoinSportRequest) {
    const newRequest = new SportRequestModel({
      sportId: params.sportId,
      userId: params.studentId,
      status: RequestStatus.Pending,
      whyJoin: params.reason,
      additionalInfo: params.additionalInfo || "",
      createdAt: new Date(),
    });
    await newRequest.save();
    return newRequest.toObject() as RawJoinRequest;
  }

  async joinEvent(params: JoinEventRequest) {
    const newRequest = new EventRequestModel({
      eventId: params.eventId,
      userId: params.studentId,
      status: RequestStatus.Pending,
      whyJoin: params.reason,
      additionalInfo: params.additionalInfo || "",
      createdAt: new Date(),
    });
    await newRequest.save();
    return newRequest.toObject() as RawJoinRequest;
  }
}