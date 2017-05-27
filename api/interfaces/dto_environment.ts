import { DtoVariable } from "./dto_variable";

export interface DtoEnvironment {

    id: string;

    name: string;

    teamId: string;

    variables: DtoVariable[];
}