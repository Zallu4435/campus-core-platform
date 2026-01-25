import { CampusEvent, Sport, Club } from "../../../domain/campus-life/entities/CampusLife";

/**
 * Campus Life Overview DTOs
 */

export interface GetCampusLifeOverviewRequestDTO { }

export interface CampusLifeOverviewResponseDTO {
    events: CampusEvent[];
    sports: Sport[];
    clubs: Club[];
}
