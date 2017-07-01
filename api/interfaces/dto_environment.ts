import { DtoVariable } from './dto_variable';
import { DtoProject } from './dto_project';

export interface DtoEnvironment {

    id: string;

    name: string;

    project: Partial<DtoProject>;

    variables: DtoVariable[];
}