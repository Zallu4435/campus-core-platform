import { SportProps, SportStatus } from "./SportTypes";

export class Sport {
  private idValue?: string;
  private titleValue: string;
  private typeValue: string;
  private categoryValue: string;
  private organizerValue: string;
  private organizerTypeValue: string;
  private iconValue: string;
  private colorValue: string;
  private divisionValue: string;
  private headCoachValue: string;
  private homeGamesValue: number;
  private recordValue: string;
  private upcomingGamesValue: { date: string; description: string }[];
  private participantsValue: number;
  private statusValue: SportStatus;
  private createdAtValue?: Date;
  private updatedAtValue?: Date;
  private playerCountValue?: number;
  private formedOnValue?: string;
  private logoValue?: string;

  constructor(props: SportProps) {
    this.idValue = props.id;
    this.titleValue = props.title;
    this.typeValue = props.type;
    this.categoryValue = props.category;
    this.organizerValue = props.organizer;
    this.organizerTypeValue = props.organizerType;
    this.iconValue = props.icon;
    this.colorValue = props.color;
    this.divisionValue = props.division;
    this.headCoachValue = props.headCoach;
    this.homeGamesValue = props.homeGames;
    this.recordValue = props.record;
    this.upcomingGamesValue = props.upcomingGames;
    this.participantsValue = props.participants;
    this.statusValue = props.status || SportStatus.Active;
    this.createdAtValue = props.createdAt;
    this.updatedAtValue = props.updatedAt;
    this.playerCountValue = props.playerCount;
    this.formedOnValue = props.formedOn;
    this.logoValue = props.logo;
  }

  static create(props: SportProps): Sport {
    if (!props.title || props.title.length < 3) {
      throw new Error("Invalid title");
    }
    return new Sport(props);
  }

  get id(): string | undefined { return this.idValue; }
  get title(): string { return this.titleValue; }
  get type(): string { return this.typeValue; }
  get category(): string { return this.categoryValue; }
  get organizer(): string { return this.organizerValue; }
  get organizerType(): string { return this.organizerTypeValue; }
  get icon(): string { return this.iconValue; }
  get color(): string { return this.colorValue; }
  get division(): string { return this.divisionValue; }
  get headCoach(): string { return this.headCoachValue; }
  get homeGames(): number { return this.homeGamesValue; }
  get record(): string { return this.recordValue; }
  get upcomingGames(): { date: string; description: string }[] { return this.upcomingGamesValue; }
  get participants(): number { return this.participantsValue; }
  get status(): SportStatus { return this.statusValue; }
  get createdAt(): Date | undefined { return this.createdAtValue; }
  get updatedAt(): Date | undefined { return this.updatedAtValue; }
  get playerCount(): number | undefined { return this.playerCountValue; }
  get formedOn(): string | undefined { return this.formedOnValue; }
  get logo(): string | undefined { return this.logoValue; }
}