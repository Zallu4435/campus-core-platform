import { FilterQuery } from "mongoose";
import {
  GetClubsRequestDTO,
  CreateClubRequestDTO,
  GetClubRequestsRequestDTO,
  GetClubRequestDetailsRequestDTO
} from "../../../application/clubs/dtos/ClubRequestDTOs";
import {
  GetClubsResponseDTO,
  GetClubRequestsResponseDTO,
  GetClubRequestDetailsResponseDTO
} from "../../../application/clubs/dtos/ClubResponseDTOs";
import { ClubDataDTO } from "../../../application/clubs/dtos/ClubBaseDTOs";
import { IClubsRepository } from "../../../application/clubs/repositories/IClubsRepository";
import { ClubModel, ClubRequestModel } from "../../database/mongoose/clubs/ClubModel";
import { BaseRepository } from "../../../application/repositories/BaseRepository";
import { Club as ClubType, ClubRequest as ClubRequestDoc, ClubRequestStatus } from "../../../domain/clubs/entities/ClubTypes";
import { ClubMapper } from "./mappers/ClubMapper";
import { ClubRequestMapper } from "./mappers/ClubRequestMapper";
import mongoose from "mongoose";

export class ClubsRepository extends BaseRepository<ClubType, CreateClubRequestDTO, Partial<ClubDataDTO>, Record<string, unknown>, ClubType> implements IClubsRepository {
  constructor() {
    super(ClubModel);
  }

  async getClubs(params: GetClubsRequestDTO): Promise<GetClubsResponseDTO> {
    const { page, limit, category, status, startDate, endDate, search } = params;
    const query: FilterQuery<ClubType> = {};

    if (category && category.toLowerCase() !== "all") {
      query.type = { $regex: `^${category}$`, $options: "i" };
    }
    if (status && status.toLowerCase() !== "all") {
      query.status = status;
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const clubsDocs = await ClubModel.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as ClubType[];

    const totalItems = await ClubModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      clubs: ClubMapper.toSummaryDTOList(clubsDocs),
      totalItems,
      totalPages,
      currentPage: page,
    };
  }

  async getClubRequests(params: GetClubRequestsRequestDTO): Promise<GetClubRequestsResponseDTO> {
    const { page, limit, status, type, startDate, endDate, search } = params;
    const query: FilterQuery<ClubRequestDoc> = {};

    if (status && status.toLowerCase() !== "all") {
      query.status = status;
    }

    const clubQuery: FilterQuery<ClubType> = {};
    if (type && type.toLowerCase() !== "all") {
      clubQuery.type = { $regex: `^${type}$`, $options: "i" };
    }

    if (search && search.trim() !== "") {
      clubQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    const matchingClubs = await ClubModel.find(clubQuery).select("_id").lean();
    const clubIds = matchingClubs.map((club) => club._id);

    if (search && search.trim() !== "") {
      const userMatches = await mongoose.model('User').find({ email: { $regex: search, $options: "i" } }).select("_id").lean();
      const userIds = userMatches.map((u) => u._id);

      if (clubIds.length === 0 && userIds.length === 0) {
        return { data: [], totalItems: 0, totalPages: 0, currentPage: page };
      }

      query.$or = [];
      if (clubIds.length > 0) query.$or.push({ clubId: { $in: clubIds } } as any);
      if (userIds.length > 0) query.$or.push({ userId: { $in: userIds } } as any);
    } else if (clubIds.length > 0) {
      query.clubId = { $in: clubIds } as any;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      } as any;
    }

    const totalItems = await ClubRequestModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const requestDocs = await ClubRequestModel.find(query)
      .populate("clubId", "name type description")
      .populate("userId", "firstName lastName email")
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as ClubRequestDoc[];

    return {
      data: ClubRequestMapper.toDTOList(requestDocs),
      totalItems,
      totalPages,
      currentPage: page,
    };
  }

  async updateClubRequestStatus(id: string, status: ClubRequestStatus): Promise<void> {
    await ClubRequestModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { runValidators: true }
    );
  }

  async incrementClubMembers(clubId: string): Promise<void> {
    await ClubModel.findByIdAndUpdate(
      clubId,
      { $inc: { enteredMembers: 1 }, updatedAt: new Date() }
    );
  }

  async getClubRequestDetails(params: GetClubRequestDetailsRequestDTO): Promise<GetClubRequestDetailsResponseDTO> {
    const doc = await ClubRequestModel.findById(params.id)
      .populate({
        path: "clubId",
        select: "name type about nextMeeting enteredMembers description",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      })
      .lean() as unknown as ClubRequestDoc;

    if (!doc) throw new Error("Club request not found");

    return {
      request: ClubRequestMapper.toDTO(doc)
    };
  }
}