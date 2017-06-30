import { DtoVariable } from './dto_variable';
import { DtoTeam } from './dto_team';

export interface DtoEnvironment {

    id: string;

    name: string;

    team: Partial<DtoTeam>;

    variables: DtoVariable[];
}