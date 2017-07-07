import { LoginSuccessType } from '../action/user';
import { SwitchEnvType, EditEnvType, QuitProjectType, DisbandProjectType, SaveEnvironmentType, DelEnvironmentType, EditEnvCompletedType } from '../action/project';
import * as _ from 'lodash';
import { EnvironmentState, environmentDefaultValue } from '../state/environment';

export function environmentState(state: EnvironmentState = environmentDefaultValue, action: any): EnvironmentState {
    switch (action.type) {
        case LoginSuccessType: {
            return { ...state, environments: action.value.result.environments };
        }
        case SaveEnvironmentType: {
            const newEnv = action.value.env;
            const envs = [...state.environments[newEnv.project.id]];
            if (!action.value.isNew) {
                _.remove(envs, e => e.id === newEnv.id);
            }
            envs.push(newEnv);
            return { ...state, environments: { ...state.environments, [newEnv.project.id]: envs } };
        }
        case QuitProjectType:
        case DisbandProjectType: {
            const envs = { ...state.environments };
            Reflect.deleteProperty(envs, action.value.id);
            return { ...state, environments: envs };
        }
        case DelEnvironmentType: {
            const { projectId, envId } = action.value;
            const envs = { ...state.environments[projectId] };
            _.remove(envs, e => e.id === envId);
            return { ...state, environments: { ...state.environments, [projectId]: envs } };
        }
        case SwitchEnvType: {
            const { projectId, envId } = action.value;
            return { ...state, activeEnv: { [projectId]: envId } };
        }
        case EditEnvType: {
            const isEditEnvDlgOpen = action.value.envId !== 'no environment';
            return { ...state, isEditEnvDlgOpen, editedEnvironment: action.value.envId };
        }
        case EditEnvCompletedType: {
            return { ...state, isEditEnvDlgOpen: false, editedEnvironment: undefined };
        }
        default:
            return state;
    }
}