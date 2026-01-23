import { SiteSectionDTO } from "../../../../application/site-management/dtos/SiteSectionDTOs";
import { ISiteSectionDocument, ISiteSection, SiteSectionKey } from "../../../../domain/site-management/entities/SiteSectionTypes";

/**
 * Site Section Mapper
 * Handles transformation between persistence, domain, and DTO layers
 */
export class SiteSectionMapper {
    /**
     * Convert persistence document to domain entity
     */
    static toDomain(doc: ISiteSectionDocument): ISiteSection {
        const docObj = doc.toObject ? doc.toObject() : doc;
        return {
            ...docObj,
            id: doc._id.toString(),
            sectionKey: doc.sectionKey as SiteSectionKey,
            image: doc.image || '',
            link: doc.link || '',
        } as unknown as ISiteSection;
    }

    /**
     * Convert domain entity to persistence format
     */
    static toPersistence(domain: Partial<ISiteSection>): Partial<ISiteSectionDocument> {
        const persistence: Record<string, unknown> = { ...domain };
        if (domain.id) {
            persistence._id = domain.id;
            delete persistence.id;
        }
        return persistence as Partial<ISiteSectionDocument>;
    }

    /**
     * Convert domain entity to DTO (safe for API response)
     */
    static toDTO(domain: ISiteSection): SiteSectionDTO {
        return {
            ...domain,
            id: domain.id,
            image: domain.image || '',
            link: domain.link || '',
            createdAt: domain.createdAt instanceof Date ? domain.createdAt.toISOString() : domain.createdAt,
            updatedAt: domain.updatedAt instanceof Date ? domain.updatedAt.toISOString() : domain.updatedAt,
        } as unknown as SiteSectionDTO;
    }

    /**
     * Directly convert document to DTO
     */
    static docToDTO(doc: ISiteSectionDocument): SiteSectionDTO {
        return this.toDTO(this.toDomain(doc));
    }
}
