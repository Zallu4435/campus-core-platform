import { MaterialProps } from "../../../domain/materials/entities/Material";

export interface GetUserMaterialsResponseDTO {
  materials: Array<MaterialProps & { isBookmarked: boolean; isLiked: boolean }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  bookmarkedMaterials: string[];
  likedMaterials: string[];
}

export interface GetUserMaterialByIdResponseDTO {
  material: MaterialProps & { isBookmarked: boolean; isLiked: boolean };
  totalPages: number;
  bookmarkedMaterials: string[];
  likedMaterials: string[];
}