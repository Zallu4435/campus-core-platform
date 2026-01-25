import { IUserSource } from "../auth/infraTypes";
import { IFacultySource } from "../faculty/infraTypes";

export type IProfileSource = IUserSource | IFacultySource;
