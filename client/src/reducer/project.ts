import { EditEnvType, SaveProjectType, QuitProjectType, DisbandProjectType, ActiveProjectType, RemoveUserType } from '../action/project';
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
            const activeProject = action.value.id === state.activeProject ? projects[_.keys(projects)[0]].id : state.activeProject;
            Reflect.deleteProperty(projects, action.value.id);
            return { ...state, projects, activeProject };
        }
        case EditEnvType: {
            const activeProject = action.value.projectId || _.keys(state.projects)[0];
            return { ...state, activeProject };
        }
        case RemoveUserType: {
            const { projectId, userId } = action.value;
            const members = (state.projects[projectId].members || []).filter(m => m.id !== userId);
            return {
                ...state, projects: {
                    ...state.projects,
                    [projectId]: { ...state.projects[projectId], members }
                }
            };
        }
        default:
            return state;
    }
}