import { Enquiry } from "../../../domain/enquiry/entities/Enquiry";
import { EnquiryFilter, EnquirySortOptions } from "../../../domain/enquiry/entities/EnquiryTypes";
import { IEnquiryRepository } from "../../../application/enquiry/repositories/IEnquiryRepository";
import { Enquiry as EnquiryModel } from "../../database/mongoose/enquiry/enquiry.model";
import { EnquiryMapper } from "./EnquiryMapper";

export class EnquiryRepository implements IEnquiryRepository {
  private buildMongoFilter(filter: EnquiryFilter): Record<string, unknown> {
    const mongoFilter: Record<string, unknown> = {};

    if (filter.status) {
      mongoFilter.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      const createdAtFilter: Record<string, Date> = {};
      if (filter.startDate) createdAtFilter.$gte = filter.startDate;
      if (filter.endDate) createdAtFilter.$lte = filter.endDate;
      mongoFilter.createdAt = createdAtFilter;
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
    return EnquiryMapper.toDomain(saved.toObject() as unknown as Record<string, unknown>);
  }

  async find(filter: EnquiryFilter, options: { skip?: number; limit?: number; sort?: EnquirySortOptions } = {}): Promise<Enquiry[]> {
    const mongoFilter = this.buildMongoFilter(filter);
    const results = await EnquiryModel.find(mongoFilter)
      .sort(options.sort as any ?? { createdAt: -1 })
      .skip(options.skip ?? 0)
      .limit(options.limit ?? 10)
      .lean();

    return results.map(doc => EnquiryMapper.toDomain(doc as unknown as Record<string, unknown>));
  }

  async count(filter: EnquiryFilter): Promise<number> {
    const mongoFilter = this.buildMongoFilter(filter);
    return EnquiryModel.countDocuments(mongoFilter);
  }

  async findById(id: string): Promise<Enquiry | null> {
    const result = await EnquiryModel.findById(id).lean();
    return result ? EnquiryMapper.toDomain(result as unknown as Record<string, unknown>) : null;
  }

  async update(id: string, enquiry: Enquiry): Promise<Enquiry | null> {
    const persistenceData = EnquiryMapper.toPersistence(enquiry);
    const updated = await EnquiryModel.findByIdAndUpdate(id, persistenceData, { new: true }).lean();
    return updated ? EnquiryMapper.toDomain(updated as unknown as Record<string, unknown>) : null;
  }

  async delete(id: string): Promise<void> {
    await EnquiryModel.findByIdAndDelete(id);
  }
}