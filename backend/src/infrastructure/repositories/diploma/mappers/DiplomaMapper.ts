import { IDiplomaDocument } from '../infraTypes';
import { DiplomaSummaryDTO, DiplomaDetailsDTO } from '../../../../application/diploma/dtos/DiplomaResponseDTOs';
import { DiplomaProps } from '../../../../domain/diploma/types';

export class DiplomaMapper {
    static toDomain(doc: IDiplomaDocument): DiplomaProps {
        return {
            id: doc._id.toString(),
            title: doc.title,
            description: doc.description,
            price: doc.price,
            category: doc.category,
            thumbnail: doc.thumbnail,
            duration: doc.duration,
            prerequisites: doc.prerequisites,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            videoIds: doc.videoIds.map(id => id.toString()),
            students: doc.students?.map(id => id.toString()) || [],
        };
    }

    static toSummaryDTO(doc: IDiplomaDocument): DiplomaSummaryDTO {
        return {
            id: doc._id.toString(),
            title: doc.title,
            description: doc.description,
            price: doc.price,
            category: doc.category,
            thumbnail: doc.thumbnail,
            duration: doc.duration,
            prerequisites: doc.prerequisites,
            status: doc.status,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
            videoIds: doc.videoIds.map(id => id.toString()),
        };
    }

    static toDetailsDTO(doc: IDiplomaDocument): DiplomaDetailsDTO {
        return {
            id: doc._id.toString(),
            title: doc.title,
            description: doc.description,
            price: doc.price,
            category: doc.category,
            thumbnail: doc.thumbnail,
            duration: doc.duration,
            prerequisites: doc.prerequisites,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            videoIds: doc.videoIds.map(id => id.toString()),
            students: doc.students?.map(id => id.toString()) || [],
        };
    }

    static toSummaryDTOList(docs: IDiplomaDocument[]): DiplomaSummaryDTO[] {
        return docs.map(doc => this.toSummaryDTO(doc));
    }
}
