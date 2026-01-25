import { FilterQuery } from "mongoose";
import {
  GetEventsRequestDTO,
  CreateEventRequestDTO,
  GetEventRequestsRequestDTO,
  GetEventRequestDetailsRequestDTO
} from "../../../application/events/dtos/EventRequestDTOs";
import {
  GetEventsResponseDTO,
  GetEventRequestsResponseDTO,
  GetEventRequestDetailsResponseDTO
} from "../../../application/events/dtos/EventResponseDTOs";
import { EventDataDTO } from "../../../application/events/dtos/EventBaseDTOs";
import { IEventsRepository } from "../../../application/events/repositories/IEventsRepository";
import {
  CampusEventModel,
  EventRequestModel,
} from "../../../infrastructure/database/mongoose/events/CampusEventModel";
import { BaseRepository } from "../shared/BaseRepository";
import { EventData, EventRequestData, EventRequestStatus } from "../../../domain/events/entities/EventTypes";
import { EventMapper } from "./mappers/EventMapper";
import { EventRequestMapper } from "./mappers/EventRequestMapper";
import { Model } from "mongoose";

export class EventsRepository extends BaseRepository<EventData, CreateEventRequestDTO, Partial<EventDataDTO>, Record<string, unknown>, EventData> implements IEventsRepository {
  constructor() {
    super(CampusEventModel as unknown as Model<EventData>);
  }

  private mapRawToData<T extends { _id: any }>(raw: T): Omit<T, '_id'> & { id: string } {
    const { _id, ...rest } = raw;
    return { id: _id.toString(), ...rest } as Omit<T, '_id'> & { id: string };
  }

  async getEvents(params: GetEventsRequestDTO): Promise<GetEventsResponseDTO> {
    const { page, limit, type, status, startDate, endDate, search, organizerType, dateRange } = params;
    const query: FilterQuery<any> = {};

    if (type && type !== "all") {
      query.eventType = { $regex: `^${type}$`, $options: "i" };
    }

    if (status && status !== "all") {
      query.status = { $regex: `^${status}$`, $options: "i" };
    }

    if (organizerType && organizerType !== "all") {
      query.organizerType = { $regex: `^${organizerType}$`, $options: "i" };
    }

    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let calculatedStartDate: Date;

      switch (dateRange) {
        case "last_week":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "last_month":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "last_3_months":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case "last_6_months":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 180));
          break;
        case "last_year":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 365));
          break;
        default:
          calculatedStartDate = now;
      }

      query.date = { $gte: calculatedStartDate.toISOString().split('T')[0] };
    } else if (startDate || endDate) {
      const dateQuery: { $gte?: string; $lte?: string } = {};
      if (startDate) dateQuery.$gte = new Date(startDate).toISOString().split('T')[0];
      if (endDate) dateQuery.$lte = new Date(endDate).toISOString().split('T')[0];
      query.date = dateQuery;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { organizer: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const eventsDocs = await CampusEventModel.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const eventsData = eventsDocs.map(e => this.mapRawToData(e));
    const totalItems = await CampusEventModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      events: EventMapper.toSummaryDTOList(eventsData),
      totalItems,
      totalPages,
      currentPage: page,
    };
  }

  async getEventRequests(params: GetEventRequestsRequestDTO): Promise<GetEventRequestsResponseDTO> {
    const { page, limit, status, startDate, endDate, type, search, organizerType, dateRange } = params;
    const query: FilterQuery<any> = {};

    if (status && status !== "all") {
      query.status = status as EventRequestStatus;
    }

    const eventQuery: FilterQuery<any> = {};

    if (type && type.toLowerCase() !== "all") {
      eventQuery.eventType = { $regex: `^${type}$`, $options: "i" };
    }

    if (organizerType && organizerType !== "all") {
      eventQuery.organizerType = { $regex: `^${organizerType}$`, $options: "i" };
    }

    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let calculatedStartDate: Date;

      switch (dateRange) {
        case "last_week":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "last_month":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "last_3_months":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case "last_6_months":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 180));
          break;
        case "last_year":
          calculatedStartDate = new Date(now.setDate(now.getDate() - 365));
          break;
        default:
          calculatedStartDate = now;
      }

      eventQuery.date = { $gte: calculatedStartDate.toISOString().split('T')[0] };
    } else if (startDate || endDate) {
      const dateQuery: { $gte?: string; $lte?: string } = {};
      if (startDate) dateQuery.$gte = new Date(startDate).toISOString().split('T')[0];
      if (endDate) dateQuery.$lte = new Date(endDate).toISOString().split('T')[0];
      eventQuery.date = dateQuery;
    }

    if (search && search.trim()) {
      eventQuery.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { organizer: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const matchingEvents = await CampusEventModel.find(eventQuery).select("_id").lean();
    const eventIds = matchingEvents.map((event) => event._id);
    if (eventIds.length > 0) {
      query.eventId = { $in: eventIds };
    }

    const totalItems = await EventRequestModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const rawRequests = await EventRequestModel.find(query)
      .populate({
        path: "eventId",
        select: "title eventType date organizer location description participants"
      })
      .populate("userId", "firstName lastName email")
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const requestData = rawRequests.map(r => this.mapRawToData(r)) as unknown as EventRequestData[];

    return {
      data: EventRequestMapper.toDTOList(requestData),
      totalItems,
      totalPages,
      currentPage: page,
    };
  }

  async updateEventRequestStatus(id: string, status: EventRequestStatus): Promise<void> {
    await EventRequestModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { runValidators: true }
    );
  }

  async incrementEventParticipants(eventId: string): Promise<void> {
    await CampusEventModel.findByIdAndUpdate(
      eventId,
      { $inc: { participants: 1 }, updatedAt: new Date() }
    );
  }

  async getEventRequestDetails(params: GetEventRequestDetailsRequestDTO): Promise<GetEventRequestDetailsResponseDTO> {
    const doc = await EventRequestModel.findById(params.id)
      .populate({
        path: "eventId",
        select: "title description date location participants eventType",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      })
      .lean();

    if (!doc) throw new Error("Event request not found");

    const data = this.mapRawToData(doc);

    return {
      eventRequest: EventRequestMapper.toDTO(data as unknown as EventRequestData)
    };
  }
}
