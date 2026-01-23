import { CampusEvent, Sport, Club } from "../../../domain/campus-life/entities/CampusLife";
import { EventStatus, RequestStatus } from "../../../domain/campus-life/enums/CampusLifeEnums";

/**
 * Campus Life Overview DTOs
 */

export interface GetCampusLifeOverviewRequestDTO { }

export interface CampusLifeOverviewResponseDTO {
    events: CampusEvent[];
    sports: Sport[];
    clubs: Club[];
}
