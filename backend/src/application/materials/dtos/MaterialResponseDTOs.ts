import { MaterialType, MaterialDifficulty, MaterialProps } from "../../../domain/materials/entities/MaterialTypes";

export interface GetMaterialsResponseDTO {
  materials: Array<Pick<MaterialProps, 'id' | 'title' | 'description' | 'subject' | 'course' | 'semester' | 'type' | 'fileUrl' | 'thumbnailUrl' | 'tags' | 'difficulty' | 'estimatedTime' | 'isNewMaterial' | 'isRestricted' | 'uploadedBy' | 'uploadedAt' | 'views' | 'downloads' | 'rating'>>;
  totalPages: number;
}
export interface GetMaterialByIdResponseDTO {
  material: MaterialProps;
}
export interface CreateMaterialResponseDTO {
  material: MaterialProps;
}
export interface UpdateMaterialResponseDTO {
  material: MaterialProps;
} 