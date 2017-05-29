import { DtoResTeam } from '../../../api/interfaces/dto_res';

export interface TeamState {

    teams: _.Dictionary<DtoResTeam>;

    activeTeam: string;
}

export const teamDefaultValue: TeamState = {
    teams: {},
    activeTeam: ''
};