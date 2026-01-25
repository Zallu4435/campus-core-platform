import { Enquiry, EnquiryProps } from "../../../domain/enquiry/entities/Enquiry";
import { EnquiryStatus } from "../../../domain/enquiry/entities/EnquiryTypes";
import { IEnquirySource } from "./infraTypes";

export class EnquiryMapper {
    static toDomain(raw: IEnquirySource): Enquiry {
        const props: EnquiryProps = {
            id: raw._id.toString(),
            name: raw.name,
            email: raw.email,
            subject: raw.subject,
            message: raw.message,
            status: raw.status as EnquiryStatus,
            createdAt: raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt || Date.now()),
            updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt : new Date(raw.updatedAt || Date.now()),
        };
        return new Enquiry(props);
    }

    static toPersistence(enquiry: Enquiry): Partial<IEnquirySource> {
        return {
            name: enquiry.name,
            email: enquiry.email,
            subject: enquiry.subject,
            message: enquiry.message,
            status: enquiry.status,
        };
    }

    static toDTO(enquiry: Enquiry): EnquiryProps {
        return enquiry.props;
    }
}
