import { LoginSuccessType } from '../action/login';
import { SwitchEnvType, EditEnvType, QuitTeamType, DisbandTeamType, SaveEnvironmentType, DelEnvironmentType, EditEnvCompletedType } from '../action/team';
import * as _ from 'lodash';
import { EnvironmentState, environmentDefaultValue } from '../state/environment';

export function environmentState(state: EnvironmentState = environmentDefaultValue, action: any): EnvironmentState {
    switch (action.type) {
        case LoginSuccessType: {
            return { ...state, environments: action.value.result.environments };
        }
        case SaveEnvironmentType: {
            const newEnv = action.value.env;
            const envs = state.environments[newEnv.team.id];
            if (!action.value.isNew) {
                _.remove(envs, e => e.id === newEnv.id);
            }
            return { ...state, environments: { ...state.environments, [newEnv.team.id]: [...envs, newEnv] } };
        }
        case QuitTeamType:
        case DisbandTeamType: {
            const envs = state.environments;
            Reflect.deleteProperty(envs, action.value.id);
            return { ...state, environments: { ...envs } };
        }
        case DelEnvironmentType: {
            const { teamId, envId } = action.value;
            const envs = state.environments[teamId];
            _.remove(envs, e => e.id === envId);
            return { ...state, environments: { ...state.environments, [teamId]: [...envs] } };
        }
        case SwitchEnvType: {
            const { teamId, envId } = action.value;
            return { ...state, activeEnv: { [teamId]: envId } };
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