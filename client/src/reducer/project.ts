import { EditEnvType, SaveProjectType, QuitProjectType, DisbandProjectType, ActiveProjectType, RemoveUserType, SaveLocalhostMappingType, SaveGlobalFunctionType, AddProjectFileType, DeleteProjectFileType } from '../action/project';
import { LoginSuccessType, SyncUserDataSuccessType } from '../action/user';
import * as _ from 'lodash';
import { ProjectState, projectDefaultValue } from '../state/project';
import { ProjectFileTypes } from '../common/custom_type';

export function projectState(state: ProjectState = projectDefaultValue, action: any): ProjectState {
    switch (action.type) {
        case LoginSuccessType:
        case SyncUserDataSuccessType: {
            const projects = action.value.result.projects;
            const projectFiles = action.value.result.projectFiles;
            const projectIds = _.keys(projects);
            const activeProject = state.activeProject || (projectIds.length > 0 ? (projectIds[0] || '') : '');
            return { ...state, projects, activeProject, projectFiles };
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
        case AddProjectFileType: {
            const { pid, type, name, path } = action.value;
            if (type === ProjectFileTypes.lib) {
                return {
                    ...state, projectFiles: {
                        ...state.projectFiles,
                        projectJS: {
                            ...state.projectFiles.projectJS, [pid]: {
                                ...(state.projectFiles.projectJS[pid] || {}), [name]: { name, path, size: 0, createdDate: new Date() }
                            }
                        }
                    }
                };
            } else {
                return {
                    ...state, projectFiles: {
                        ...state.projectFiles,
                        projectData: {
                            ...state.projectFiles.projectData, [pid]: {
                                ...(state.projectFiles.projectData[pid] || {}), [name]: { name, path, size: 0, createdDate: new Date() }
                            }
                        }
                    }
                };
            }
        }
        case DeleteProjectFileType: {
            const { pid, type, name } = action.value;
            if (type === ProjectFileTypes.lib) {
                const projectJS = { ...(state.projectFiles.projectJS[pid] || {}) };
                Reflect.deleteProperty(projectJS, name);
                return { ...state, projectFiles: { ...state.projectFiles, projectJS: { ...state.projectFiles.projectJS, [pid]: projectJS } } };
            } else {
                const projectData = { ...(state.projectFiles.projectData[pid] || {}) };
                Reflect.deleteProperty(projectData, name);
                return { ...state, projectFiles: { ...state.projectFiles, projectData: { ...state.projectFiles.projectData, [pid]: projectData } } };
            }
        }
        default:
            return state;
    }
}