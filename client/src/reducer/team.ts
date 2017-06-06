import { EditEnvType, SaveTeamType, QuitTeamType, DisbandTeamType, ActiveTeamType } from '../action/team';
import { LoginSuccessType } from '../action/user';
import * as _ from 'lodash';
import { TeamState, teamDefaultValue } from '../state/team';

export function teamState(state: TeamState = teamDefaultValue, action: any): TeamState {
    switch (action.type) {
        case LoginSuccessType: {
            const teams = action.value.result.teams;
            const teamIds = _.keys(teams);
            const activeTeam = teamIds.length > 0 ? (teamIds[0] || '') : '';
            return { ...state, teams, activeTeam };
        }
        case SaveTeamType: {
            const team = action.value.team;
            return { ...state, teams: { ...state.teams, [team.id]: team } };
        }
        case ActiveTeamType: {
            return { ...state, activeTeam: action.value };
        }
        case QuitTeamType:
        case DisbandTeamType: {
            const teams = state.teams;
            Reflect.deleteProperty(teams, action.value.id);
            return { ...state, teams: { ...teams } };
        }
        case EditEnvType: {
            const activeTeam = action.value.teamId || _.keys(state.teams)[0];
            return { ...state, activeTeam };
        }
        default:
            return state;
    }
}