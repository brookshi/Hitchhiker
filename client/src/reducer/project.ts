import { EditEnvType, SaveProjectType, QuitProjectType, DisbandProjectType, ActiveProjectType } from '../action/project';
import { LoginSuccessType } from '../action/user';
import * as _ from 'lodash';
import { ProjectState, projectDefaultValue } from '../state/project';

export function projectState(state: ProjectState = projectDefaultValue, action: any): ProjectState {
    switch (action.type) {
        case LoginSuccessType: {
            const projects = action.value.result.projects;
            const projectIds = _.keys(projects);
            const activeProject = projectIds.length > 0 ? (projectIds[0] || '') : '';
            return { ...state, projects, activeProject };
        }
        case SaveProjectType: {
            const project = action.value.project;
            return { ...state, projects: { ...state.projects, [project.id]: project } };
        }
        case ActiveProjectType: {
            return { ...state, activeProject: action.value };
        }
        case QuitProjectType:
        case DisbandProjectType: {
            const projects = { ...state.projects };
            Reflect.deleteProperty(projects, action.value.id);
            return { ...state, projects };
        }
        case EditEnvType: {
            const activeProject = action.value.projectId || _.keys(state.projects)[0];
            return { ...state, activeProject };
        }
        default:
            return state;
    }
}