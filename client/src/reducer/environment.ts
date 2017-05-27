import { initialState, EnvironmentState } from '../state';
import { LoginSuccessType } from '../modules/login/action';
import { QuitTeamType, DisbandTeamType, SaveEnvironmentType } from '../modules/team/action';
import * as _ from 'lodash';

export function environmentState(state: EnvironmentState = initialState.environmentState, action: any): EnvironmentState {
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
        default:
            return state;
    }
}