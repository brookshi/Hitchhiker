import { initialState, TeamState } from '../state';
import { SaveTeamType } from '../modules/team/action';
import { LoginSuccessType } from '../modules/login/action';

export function teamState(state: TeamState = initialState.teamState, action: any): TeamState {
    switch (action.type) {
        case LoginSuccessType: {
            return { ...state, teams: action.value.result.teams };
        }
        case SaveTeamType: {
            const team = action.value.team;
            return { ...state, teams: { ...state.teams, [team.id]: team } };
        }
        default:
            return state;
    }
}