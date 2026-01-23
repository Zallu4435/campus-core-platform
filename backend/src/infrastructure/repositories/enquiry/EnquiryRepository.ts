import { Enquiry } from "../../../domain/enquiry/entities/Enquiry";
import { EnquiryFilter } from "../../../domain/enquiry/entities/EnquiryTypes";
import { IEnquiryRepository } from "../../../application/enquiry/repositories/IEnquiryRepository";
import { Enquiry as EnquiryModel } from "../../database/mongoose/enquiry/enquiry.model";
import { EnquiryMapper } from "./EnquiryMapper";

export class EnquiryRepository implements IEnquiryRepository {
  private buildMongoFilter(filter: EnquiryFilter) {
    const mongoFilter: any = {};

    if (filter.status) {
      mongoFilter.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      mongoFilter.createdAt = {};
      if (filter.startDate) mongoFilter.createdAt.$gte = filter.startDate;
      if (filter.endDate) mongoFilter.createdAt.$lte = filter.endDate;
    }

    if (filter.search) {
      mongoFilter.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { email: { $regex: filter.search, $options: "i" } },
        { subject: { $regex: filter.search, $options: "i" } },
        { message: { $regex: filter.search, $options: "i" } },
      ];
    }

    return mongoFilter;
  }

  async create(enquiry: Enquiry): Promise<Enquiry> {
    const persistenceData = EnquiryMapper.toPersistence(enquiry);
    const model = new EnquiryModel(persistenceData);
    const saved = await model.save();
    return EnquiryMapper.toDomain(saved);
  }

  async find(filter: EnquiryFilter, options: { skip?: number; limit?: number; sort?} = {}): Promise<Enquiry[]> {
    const mongoFilter = this.buildMongoFilter(filter);
    const results = await EnquiryModel.find(mongoFilter)
      .sort(options.sort ?? { createdAt: -1 })
      .skip(options.skip ?? 0)
      .limit(options.limit ?? 10)
      .lean();

    return results.map(EnquiryMapper.toDomain);
  }

  async count(filter: EnquiryFilter): Promise<number> {
    const mongoFilter = this.buildMongoFilter(filter);
    return EnquiryModel.countDocuments(mongoFilter);
  }

  async findById(id: string): Promise<Enquiry | null> {
    const result = await EnquiryModel.findById(id).lean();
    return result ? EnquiryMapper.toDomain(result) : null;
  }

  async update(id: string, enquiry: Enquiry): Promise<Enquiry | null> {
    const persistenceData = EnquiryMapper.toPersistence(enquiry);
    const updated = await EnquiryModel.findByIdAndUpdate(id, persistenceData, { new: true }).lean();
    return updated ? EnquiryMapper.toDomain(updated) : null;
  }

  async delete(id: string): Promise<void> {
    await EnquiryModel.findByIdAndDelete(id);
  }
}