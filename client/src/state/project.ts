import { DtoResProject } from '../../../api/interfaces/dto_res';

export interface ProjectState {

    projects: _.Dictionary<DtoResProject>;

    activeProject: string;
}

export const projectDefaultValue: ProjectState = {
    projects: {},
    activeProject: ''
};