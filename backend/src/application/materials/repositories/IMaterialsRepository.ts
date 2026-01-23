import { Material } from "../../../domain/materials/entities/Material";
import { MaterialFilter, MaterialSortOptions } from "../../../domain/materials/entities/MaterialTypes";

export interface IMaterialsRepository {
  find(filter: MaterialFilter, options?: { skip?: number; limit?: number; sort?: MaterialSortOptions }): Promise<Material[]>;
  count(filter: MaterialFilter): Promise<number>;
  findById(id: string): Promise<Material | null>;
  create(material: Material): Promise<Material>;
  update(id: string, material: Material): Promise<Material>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
  incrementDownloads(id: string): Promise<void>;
}