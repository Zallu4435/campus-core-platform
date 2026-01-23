import { Enquiry, EnquiryProps } from "../../../domain/enquiry/entities/Enquiry";
import { EnquiryStatus } from "../../../domain/enquiry/entities/EnquiryTypes";

export class EnquiryMapper {
    static toDomain(raw: Record<string, unknown>): Enquiry {
        const props: EnquiryProps = {
            id: (raw._id || raw.id) as string,
            name: raw.name as string,
            email: raw.email as string,
            subject: raw.subject as string,
            message: raw.message as string,
            status: raw.status as EnquiryStatus,
            createdAt: raw.createdAt as Date,
            updatedAt: raw.updatedAt as Date,
        };
        return new Enquiry(props);
    }

    static toPersistence(enquiry: Enquiry): Record<string, unknown> {
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
