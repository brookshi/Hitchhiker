import { DtoEnvironment } from '../common/interfaces/dto_environment';
import * as _ from 'lodash';

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