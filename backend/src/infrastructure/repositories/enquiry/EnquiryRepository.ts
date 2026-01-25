import { Enquiry } from "../../../domain/enquiry/entities/Enquiry";
import { EnquiryFilter, EnquirySortOptions } from "../../../domain/enquiry/entities/EnquiryTypes";
import { IEnquiryRepository } from "../../../application/enquiry/repositories/IEnquiryRepository";
import { Enquiry as EnquiryModel } from "../../database/mongoose/enquiry/enquiry.model";
import { EnquiryMapper } from "./EnquiryMapper";
import { IEnquirySource } from "./infraTypes";
import mongoose from 'mongoose';

export class EnquiryRepository implements IEnquiryRepository {
  private buildMongoFilter(filter: EnquiryFilter): Record<string, unknown> {
    const mongoFilter: Record<string, unknown> = {};

    if (filter.status) {
      mongoFilter.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      const dateRange: Record<string, Date> = {};
      if (filter.startDate) dateRange.$gte = filter.startDate;
      if (filter.endDate) dateRange.$lte = filter.endDate;
      mongoFilter.createdAt = dateRange;
    }

    if (filter.search) {
      const searchRegex = { $regex: filter.search, $options: "i" };
      mongoFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    return mongoFilter;
  }

  async create(enquiry: Enquiry): Promise<Enquiry> {
    const persistenceData = EnquiryMapper.toPersistence(enquiry);
    const model = new EnquiryModel(persistenceData);
    const saved = await model.save();
    return EnquiryMapper.toDomain(saved.toObject() as unknown as IEnquirySource);
  }

  async find(filter: EnquiryFilter, options: { skip?: number; limit?: number; sort?: EnquirySortOptions } = {}): Promise<Enquiry[]> {
    const mongoFilter = this.buildMongoFilter(filter);
    const results = await EnquiryModel.find(mongoFilter)
      .sort((options.sort as string | { [key: string]: mongoose.SortOrder }) ?? { createdAt: -1 })
      .skip(options.skip ?? 0)
      .limit(options.limit ?? 10)
      .lean() as unknown as IEnquirySource[];

    return results.map(doc => EnquiryMapper.toDomain(doc));
  }

  async count(filter: EnquiryFilter): Promise<number> {
    const mongoFilter = this.buildMongoFilter(filter);
    return EnquiryModel.countDocuments(mongoFilter);
  }

  async findById(id: string): Promise<Enquiry | null> {
    const result = await EnquiryModel.findById(id).lean() as unknown as IEnquirySource;
    return result ? EnquiryMapper.toDomain(result) : null;
  }

  async update(id: string, enquiry: Enquiry): Promise<Enquiry | null> {
    const persistenceData = EnquiryMapper.toPersistence(enquiry);
    const updated = await EnquiryModel.findByIdAndUpdate(id, persistenceData, { new: true }).lean() as unknown as IEnquirySource;
    return updated ? EnquiryMapper.toDomain(updated) : null;
  }

  async delete(id: string): Promise<void> {
    await EnquiryModel.findByIdAndDelete(id);
  }
}