import { DtoProject } from '../../../api/interfaces/dto_project';

export interface ProjectState {

    projects: _.Dictionary<DtoProject>;

    activeProject: string;
}

export const projectDefaultValue: ProjectState = {
    projects: {},
    activeProject: ''
};