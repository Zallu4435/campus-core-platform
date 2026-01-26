import { Material } from "../../../domain/materials/entities/Material";
import { UserMaterialFilter, MaterialSortOptions } from "../../../domain/materials/entities/MaterialTypes";

export interface IUserMaterialsRepository {
  find(filter: UserMaterialFilter, options?: { skip?: number; limit?: number; sort?: MaterialSortOptions }): Promise<Material[]>;
  count(filter: UserMaterialFilter): Promise<number>;
  findById(id: string): Promise<Material | null>;
  update(id: string, material: Material): Promise<Material | null>;
  toggleBookmark(materialId: string, userId: string): Promise<void>;
  toggleLike(materialId: string, userId: string): Promise<void>;
  isBookmarked(userId: string, materialId: string): Promise<boolean>;
  isLiked(userId: string, materialId: string): Promise<boolean>;
  incrementDownloads(materialId: string, userId: string): Promise<void>;
}