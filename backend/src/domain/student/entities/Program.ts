export interface ProgramData {
  id?: string;
  userId?: string;
  degree: string;
  catalogYear: string;
  credits: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Program {
  constructor(
    public id: string,
    public userId: string,
    public degree: string,
    public catalogYear: string,
    public createdAt: string
  ) { }
}