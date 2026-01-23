import { EventStatus, SportType, ClubStatus, RequestStatus } from '../enums/CampusLifeEnums';

/**
 * Campus Life Entities
 * Domain entities representing campus life concepts
 */

/**
 * CampusEvent Entity
 * Represents a campus event with all its details
 */
export class CampusEvent {
  constructor(
    public id: string,
    public title: string,
    public date: string,
    public time: string,
    public location: string,
    public organizer: string,
    public timeframe: string,
    public icon: string,
    public color: string,
    public description: string,
    public fullTime: string,
    public additionalInfo: string,
    public requirements: string,
    public createdAt: string,
    public updatedAt: string,
    public userRequestStatus?: RequestStatus | null
  ) { }
}

/**
 * Sport Entity
 * Represents a sport team or activity
 */
export class Sport {
  constructor(
    public id: string,
    public title: string,
    public type: SportType,
    public teams: string[],
    public icon: string,
    public color: string,
    public division: string,
    public headCoach: string,
    public homeGames: string[],
    public record: string,
    public upcomingGames: string[],
    public createdAt: string,
    public updatedAt: string,
    public userRequestStatus?: RequestStatus | null
  ) { }
}

/**
 * Club Entity
 * Represents a student club or organization
 */
export class Club {
  constructor(
    public id: string,
    public name: string,
    public type: string,
    public members: number,
    public icon: string,
    public color: string,
    public status: ClubStatus,
    public role: string,
    public nextMeeting: string,
    public about: string,
    public upcomingEvents: string[],
    public createdAt: string,
    public updatedAt: string,
    public userRequestStatus?: RequestStatus | null
  ) { }
}

/**
 * JoinRequest Entity
 * Represents a request to join an event, sport, or club
 */
export class JoinRequest {
  constructor(
    public id: string,
    public userId: string,
    public status: RequestStatus,
    public whyJoin: string,
    public additionalInfo: string,
    public createdAt: string,
    public updatedAt: string
  ) { }
}
