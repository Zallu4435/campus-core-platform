import { SiteSectionDTO } from "../../../../application/site-management/dtos/SiteSectionDTOs";
import { ISiteSectionDocument, ISiteSection, SiteSectionKey } from "../../../../domain/site-management/entities/SiteSectionTypes";
import { ISiteSectionSource } from "../infraTypes";

/**
 * Site Section Mapper
 * Handles transformation between persistence, domain, and DTO layers
 */
export class SiteSectionMapper {
    /**
     * Convert persistence document to domain entity
     */
    static toDomain(doc: ISiteSectionSource): ISiteSection {
        const docObj = (doc as any).toObject ? (doc as any).toObject() : doc;
        return {
            ...docObj,
            id: (docObj._id || docObj.id || '').toString(),
            sectionKey: docObj.sectionKey as SiteSectionKey,
            image: docObj.image || '',
            link: docObj.link || '',
            title: docObj.title || '',
            description: docObj.description || '',
            createdAt: docObj.createdAt instanceof Date ? docObj.createdAt : new Date(docObj.createdAt || Date.now()),
            updatedAt: docObj.updatedAt instanceof Date ? docObj.updatedAt : new Date(docObj.updatedAt || Date.now()),
        } as ISiteSection;
    }

    /**
     * Convert domain entity to persistence format
     */
    static toPersistence(domain: Partial<ISiteSection>): Record<string, unknown> {
        const persistence: Record<string, unknown> = { ...domain };
        if (domain.id) {
            persistence._id = domain.id;
            delete persistence.id;
        }
        return persistence;
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
    static docToDTO(doc: ISiteSectionSource): SiteSectionDTO {
        return this.toDTO(this.toDomain(doc));
    }
}
