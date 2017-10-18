import { User } from "../models/user";
import { Project } from "../models/project";
import { Environment } from "../models/environment";
import { DtoSchedule } from "./dto_schedule";
import { DtoStress } from "./dto_stress";

export interface UserData {

    user: User;

    projects: _.Dictionary<Project>;

    environments: _.Dictionary<Environment[]>;

    schedules: _.Dictionary<DtoSchedule>;

    stresses: _.Dictionary<DtoStress>;

    defaultHeaders: string;

    syncInterval: number;
}