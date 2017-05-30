import { DtoEnvironment } from '../../../api/interfaces/dto_environment';

export interface EnvironmentState {

    environments: _.Dictionary<DtoEnvironment[]>;

    activeEnv: _.Dictionary<string>;

    isEditEnvDlgOpen: boolean;

    editedEnvironment?: string;
}

export const environmentDefaultValue: EnvironmentState = {
    environments: {},
    activeEnv: {},
    isEditEnvDlgOpen: false
};