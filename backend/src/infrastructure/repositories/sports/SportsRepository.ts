import { FilterQuery } from "mongoose";
import { ISportsRepository } from "../../../application/sports/repositories/ISportsRepository";
import { TeamModel, SportRequestModel } from "../../database/mongoose/sport/sports.model";
import { User as UserModel } from "../../database/mongoose/auth/user.model";
import { SportData, SportStatus, SportRequestStatus, SportRequestData } from "../../../domain/sports/entities/SportTypes";
import { BaseRepository } from "../shared/BaseRepository";
import {
  GetSportsRequestDTO,
  CreateSportRequestDTO,
  GetSportRequestsRequestDTO,
  GetSportRequestDetailsRequestDTO
} from "../../../application/sports/dtos/SportRequestDTOs";
import {
  GetSportsResponseDTO,
  GetSportRequestsResponseDTO,
  GetSportRequestDetailsResponseDTO
} from "../../../application/sports/dtos/SportResponseDTOs";
import { SportDataDTO, SportRequestDataDTO } from "../../../application/sports/dtos/SportBaseDTOs";
import { SportMapper } from "./mappers/SportMapper";
import { SportRequestMapper } from "./mappers/SportRequestMapper";
import mongoose, { Model, Types } from "mongoose";
import { ISportSource, ISportRequestSource } from "./infraTypes";

export class SportsRepository extends BaseRepository<SportData, CreateSportRequestDTO, Partial<SportDataDTO>, Record<string, unknown>, SportData> implements ISportsRepository {
  constructor() {
    super(TeamModel as unknown as Model<SportData>);
  }

  private mapRawToData<T extends { _id: Types.ObjectId | string }>(raw: T): Omit<T, '_id'> & { id: string } {
    const { _id, ...rest } = raw;
    return { id: _id.toString(), ...rest } as Omit<T, '_id'> & { id: string };
  }

  async getSports(params: GetSportsRequestDTO): Promise<GetSportsResponseDTO> {
    const { page, limit, sportType, status, coach, startDate, endDate, search } = params;
    const query: FilterQuery<ISportSource> = {};

    if (sportType && sportType !== "all") {
      query.type = { $regex: `^${sportType}$`, $options: "i" };
    }
    if (status && status !== "all") {
      const normalizedStatus = status.toLowerCase();
      query.status = { $regex: `^${normalizedStatus}$`, $options: "i" };
    }
    if (coach && coach !== "all") {
      query.headCoach = { $regex: coach, $options: "i" };
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (search && search.trim() !== "") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { headCoach: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { division: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sportsDocs = await TeamModel.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as ISportSource[];

    const sportsData = sportsDocs.map(s => this.mapRawToData(s)) as unknown as SportData[];
    const totalItems = await TeamModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: SportMapper.toSummaryDTOList(sportsData),
      totalItems,
      totalPages,
      currentPage: page
    };
  }

  async getSportRequests(params: GetSportRequestsRequestDTO): Promise<GetSportRequestsResponseDTO> {
    const { page, limit, status, type, startDate, endDate, search } = params;
    const query: FilterQuery<ISportRequestSource> = {};

    if (status && status.toLowerCase() !== "all") {
      query.status = status as SportRequestStatus;
    }

    const sportQuery: FilterQuery<ISportSource> = {};
    if (type && type.toLowerCase() !== "all") {
      sportQuery.type = { $regex: `^${type}$`, $options: "i" };
    }

    if (search && search.trim() !== "") {
      sportQuery.$or = [
        { title: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    const matchingSports = await TeamModel.find(sportQuery).select("_id").lean();
    const sportIds = matchingSports.map((sport) => sport._id);

    if (search && search.trim() !== "") {
      const userMatches = await UserModel.find({ email: { $regex: search, $options: "i" } }).select("_id").lean();
      const userIds = userMatches.map((u) => u._id);

      if (sportIds.length === 0 && userIds.length === 0) {
        return { data: [], totalItems: 0, totalPages: 0, currentPage: page };
      }

      query.$or = [];
      if (sportIds.length > 0) query.$or.push({ sportId: { $in: sportIds } });
      if (userIds.length > 0) query.$or.push({ userId: { $in: userIds } });
    } else if (sportIds.length > 0) {
      query.sportId = { $in: sportIds };
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalItems = await SportRequestModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const requestsDocs = await SportRequestModel.find(query)
      .populate({ path: "sportId", select: "title type" })
      .populate({ path: "userId", select: "firstName lastName email" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as ISportRequestSource[];

    const requestsData = requestsDocs.map(r => this.mapRawToData(r)) as unknown as SportRequestData[];

    return {
      data: SportRequestMapper.toDTOList(requestsData),
      totalItems,
      totalPages,
      currentPage: page
    };
  }

  async updateSportRequestStatus(id: string, status: SportRequestStatus): Promise<void> {
    await SportRequestModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { runValidators: true }
    );
  }

  async incrementSportParticipants(sportId: string): Promise<void> {
    await TeamModel.findByIdAndUpdate(
      sportId,
      { $inc: { participants: 1 }, updatedAt: new Date() }
    );
  }

  async getSportRequestDetails(params: GetSportRequestDetailsRequestDTO): Promise<GetSportRequestDetailsResponseDTO> {
    const doc = await SportRequestModel.findById(params.id)
      .populate({ path: "sportId", select: "title type headCoach participants division" })
      .populate({ path: "userId", select: "firstName lastName email" })
      .lean() as unknown as ISportRequestSource | null;

    if (!doc) throw new Error("Sport request not found");

    const data = this.mapRawToData(doc);

    return {
      sportRequest: SportRequestMapper.toDTO(data as unknown as SportRequestData)
    };
  }

  async createSportRequest(params: SportRequestDataDTO & { status: SportRequestStatus }): Promise<void> {
    const newRequest = new SportRequestModel({
      sportId: params.sportId,
      userId: params.userId,
      whyJoin: params.whyJoin,
      additionalInfo: params.additionalInfo || "",
      status: params.status,
    });
    await newRequest.save();
  }
}