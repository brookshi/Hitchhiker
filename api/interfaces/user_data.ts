import { User } from '../models/user';
import { Project } from '../models/project';
import { Environment } from '../models/environment';
import { DtoSchedule } from './dto_schedule';
import { DtoStress } from './dto_stress';
import { DtoCollectionWithRecord } from './dto_collection';
import { ProjectFiles } from './dto_project_data';

export interface UserData {

    user: User;

    collection: DtoCollectionWithRecord;

    projects: _.Dictionary<Project>;

    environments: _.Dictionary<Environment[]>;

    schedules: _.Dictionary<DtoSchedule>;

    stresses: _.Dictionary<DtoStress>;

    projectFiles: ProjectFiles;

    defaultHeaders: string;

    syncInterval: number;

    sync: boolean;

    enableUpload: boolean;
}