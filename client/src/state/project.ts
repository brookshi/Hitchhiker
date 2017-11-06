import { DtoProject } from '../../../api/interfaces/dto_project';
import { ProjectFiles } from '../../../api/interfaces/dto_project_data';

export interface ProjectState {

    projects: _.Dictionary<DtoProject>;

    activeProject: string;

    projectFiles: ProjectFiles;
}

export const projectDefaultValue: ProjectState = {
    projects: {},
    activeProject: '',
    projectFiles: {
        globalJS: {},
        globalData: {},
        projectJS: {},
        projectData: {}
    }
};