import { DtoVariable } from "./dto_variable";

export interface DtoEnvironment {

    id: string;

    name: string;

    variables: DtoVariable[];
}