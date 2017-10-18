import { EditEnvType, SaveProjectType, QuitProjectType, DisbandProjectType, ActiveProjectType, RemoveUserType, SaveLocalhostMappingType, SaveGlobalFunctionType } from '../action/project';
import { LoginSuccessType, SyncUserDataSuccessType } from '../action/user';
import * as _ from 'lodash';
import { ProjectState, projectDefaultValue } from '../state/project';

export function projectState(state: ProjectState = projectDefaultValue, action: any): ProjectState {
    switch (action.type) {
        case LoginSuccessType:
        case SyncUserDataSuccessType: {
            const projects = action.value.result.projects;
            const projectIds = _.keys(projects);
            const activeProject = state.activeProject || (projectIds.length > 0 ? (projectIds[0] || '') : '');
            return { ...state, projects, activeProject };
        }
        case SaveProjectType: {
            const project = action.value.project;
            return { ...state, projects: { ...state.projects, [project.id]: project }, activeProject: project.id };
        }
        case ActiveProjectType: {
            return { ...state, activeProject: action.value };
        }
        case QuitProjectType:
        case DisbandProjectType: {
            const projects = { ...state.projects };
            Reflect.deleteProperty(projects, action.value.id);
            const activeProject = action.value.id === state.activeProject ? (projects[_.keys(projects)[0]].id || '') : state.activeProject;
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
        case SaveLocalhostMappingType: {
            const { isNew, id, projectId, userId, ip } = action.value;
            let localhosts = [...(state.projects[projectId].localhosts || [])];
            if (!isNew) {
                localhosts = localhosts.filter(l => l.id !== id);
            }
            localhosts = [...localhosts, { id, userId, ip }];
            return {
                ...state, projects: {
                    ...state.projects,
                    [projectId]: {
                        ...state.projects[projectId],
                        localhosts
                    }
                }
            };
        }
        case SaveGlobalFunctionType: {
            const { projectId, globalFunc } = action.value;
            return {
                ...state, projects: {
                    ...state.projects,
                    [projectId]: {
                        ...state.projects[projectId],
                        globalFunction: globalFunc
                    }
                }
            };
        }
        default:
            return state;
    }
}