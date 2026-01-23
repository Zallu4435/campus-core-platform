import { Enquiry, EnquiryProps } from "../../../domain/enquiry/entities/Enquiry";

export class EnquiryMapper {
    static toDomain(raw: any): Enquiry {
        const props: EnquiryProps = {
            id: raw._id?.toString() ?? raw.id,
            name: raw.name,
            email: raw.email,
            subject: raw.subject,
            message: raw.message,
            status: raw.status,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
        return new Enquiry(props);
    }

    static toPersistence(enquiry: Enquiry): any {
        return {
            name: enquiry.name,
            email: enquiry.email,
            subject: enquiry.subject,
            message: enquiry.message,
            status: enquiry.status,
        };
    }

    static toDTO(enquiry: Enquiry): any {
        return enquiry.toJSON();
    }
}
