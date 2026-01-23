import { Enquiry } from "../../../domain/enquiry/entities/Enquiry";
import { EnquiryFilter, EnquirySortOptions } from "../../../domain/enquiry/entities/EnquiryTypes";

export interface IEnquiryRepository {
  create(enquiry: Enquiry): Promise<Enquiry>;
  find(filter: EnquiryFilter, options: { skip?: number; limit?: number; sort?: EnquirySortOptions }): Promise<Enquiry[]>;
  count(filter: EnquiryFilter): Promise<number>;
  findById(id: string): Promise<Enquiry | null>;
  update(id: string, enquiry: Enquiry): Promise<Enquiry | null>;
  delete(id: string): Promise<void>;
}