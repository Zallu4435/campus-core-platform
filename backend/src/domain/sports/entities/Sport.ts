import { SportProps, SportStatus } from "./SportTypes";

export class Sport {
  private _id?: string;
  private _title: string;
  private _type: string;
  private _category: string;
  private _organizer: string;
  private _organizerType: string;
  private _icon: string;
  private _color: string;
  private _division: string;
  private _headCoach: string;
  private _homeGames: number;
  private _record: string;
  private _upcomingGames: { date: string; description: string }[];
  private _participants: number;
  private _status: SportStatus;
  private _createdAt?: Date;
  private _updatedAt?: Date;
  private _playerCount?: number;
  private _formedOn?: string;
  private _logo?: string;

  constructor(props: SportProps) {
    this._id = props.id;
    this._title = props.title;
    this._type = props.type;
    this._category = props.category;
    this._organizer = props.organizer;
    this._organizerType = props.organizerType;
    this._icon = props.icon;
    this._color = props.color;
    this._division = props.division;
    this._headCoach = props.headCoach;
    this._homeGames = props.homeGames;
    this._record = props.record;
    this._upcomingGames = props.upcomingGames;
    this._participants = props.participants;
    this._status = props.status || SportStatus.Active;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._playerCount = props.playerCount;
    this._formedOn = props.formedOn;
    this._logo = props.logo;
  }

  static create(props: SportProps): Sport {
    if (!props.title || props.title.length < 3) {
      throw new Error("Invalid title");
    }
    return new Sport(props);
  }

  get id(): string | undefined { return this._id; }
  get title(): string { return this._title; }
  get type(): string { return this._type; }
  get category(): string { return this._category; }
  get organizer(): string { return this._organizer; }
  get organizerType(): string { return this._organizerType; }
  get icon(): string { return this._icon; }
  get color(): string { return this._color; }
  get division(): string { return this._division; }
  get headCoach(): string { return this._headCoach; }
  get homeGames(): number { return this._homeGames; }
  get record(): string { return this._record; }
  get upcomingGames(): { date: string; description: string }[] { return this._upcomingGames; }
  get participants(): number { return this._participants; }
  get status(): SportStatus { return this._status; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }
  get playerCount(): number | undefined { return this._playerCount; }
  get formedOn(): string | undefined { return this._formedOn; }
  get logo(): string | undefined { return this._logo; }
}