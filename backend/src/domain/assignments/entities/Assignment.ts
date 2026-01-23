import { AssignmentFile } from '../types/AssignmentTypes';
import { AssignmentStatus } from '../enums/AssignmentEnums';

export interface IAssignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  maxMarks: number;
  dueDate: Date;
  files: AssignmentFile[];
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
  totalSubmissions: number;
  averageMarks: number;
}

export class Assignment implements IAssignment {
  constructor(
    public readonly id: string,
    public title: string,
    public subject: string,
    public description: string,
    public maxMarks: number,
    public dueDate: Date,
    public files: AssignmentFile[],
    public status: AssignmentStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public totalSubmissions: number,
    public averageMarks: number
  ) { }

  static create(props: {
    id: string;
    title: string;
    subject: string;
    dueDate: Date;
    maxMarks: number;
    description: string;
    files: AssignmentFile[];
    status?: AssignmentStatus;
    totalSubmissions?: number;
    averageMarks?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Assignment {
    const now = new Date();
    return new Assignment(
      props.id,
      props.title,
      props.subject,
      props.description,
      props.maxMarks,
      props.dueDate,
      props.files,
      props.status || AssignmentStatus.Draft,
      props.createdAt || now,
      props.updatedAt || now,
      props.totalSubmissions || 0,
      props.averageMarks || 0
    );
  }

  update(props: {
    title?: string;
    subject?: string;
    dueDate?: Date;
    maxMarks?: number;
    description?: string;
    files?: AssignmentFile[];
    status?: AssignmentStatus;
  }): void {
    if (props.title !== undefined) this.title = props.title;
    if (props.subject !== undefined) this.subject = props.subject;
    if (props.dueDate !== undefined) this.dueDate = props.dueDate;
    if (props.maxMarks !== undefined) this.maxMarks = props.maxMarks;
    if (props.description !== undefined) this.description = props.description;
    if (props.files !== undefined) this.files = props.files;
    if (props.status !== undefined) this.status = props.status;

    this.updatedAt = new Date();
  }

  updateStats(totalSubmissions: number, averageMarks: number): void {
    this.totalSubmissions = totalSubmissions;
    this.averageMarks = averageMarks;
    this.updatedAt = new Date();
  }
}