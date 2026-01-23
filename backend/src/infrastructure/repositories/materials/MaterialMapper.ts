import { Material, MaterialProps } from "../../../domain/materials/entities/Material";
import { MaterialType, MaterialDifficulty } from "../../../domain/materials/entities/MaterialTypes";

export class MaterialMapper {
    static toDomain(raw: Record<string, unknown>): Material {
        const props: MaterialProps = {
            id: raw._id?.toString() || raw.id?.toString() || '',
            title: raw.title as string,
            description: raw.description as string,
            subject: raw.subject as string,
            course: raw.course as string,
            semester: raw.semester as string,
            type: raw.type as MaterialType,
            fileUrl: raw.fileUrl as string,
            thumbnailUrl: raw.thumbnailUrl as string,
            tags: (raw.tags as string[]) || [],
            difficulty: raw.difficulty as MaterialDifficulty,
            estimatedTime: raw.estimatedTime as string,
            isNewMaterial: raw.isNewMaterial as boolean,
            isRestricted: raw.isRestricted as boolean,
            uploadedBy: raw.uploadedBy as string,
            uploadedAt: raw.uploadedAt instanceof Date ? raw.uploadedAt.toISOString() : (raw.uploadedAt as string),
            views: (raw.views as number) || 0,
            downloads: (raw.downloads as number) || 0,
            rating: (raw.rating as number) || 0,
        };
        return new Material(props);
    }

    static toPersistence(material: Material): Record<string, unknown> {
        return {
            title: material.title,
            description: material.description,
            subject: material.subject,
            course: material.course,
            semester: material.semester,
            type: material.type,
            fileUrl: material.fileUrl,
            thumbnailUrl: material.thumbnailUrl,
            tags: material.tags,
            difficulty: material.difficulty,
            estimatedTime: material.estimatedTime,
            isNewMaterial: material.isNewMaterial,
            isRestricted: material.isRestricted,
            uploadedBy: material.uploadedBy,
            uploadedAt: material.uploadedAt,
            views: material.views,
            downloads: material.downloads,
            rating: material.rating,
        };
    }

    static toDTO(material: Material): Record<string, unknown> {
        return material.toJSON() as unknown as Record<string, unknown>;
    }
}
