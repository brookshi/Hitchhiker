import { DtoStress } from '../../../api/interfaces/dto_stress';
import { StressRunResult } from '../../../api/interfaces/dto_stress_setting';

export interface StressTestState {

    stresses: _.Dictionary<DtoStress>;

    activeStress: string;

    currentRunStress: string;

    runState?: StressRunResult;
}

export const stressDefaultValue: StressTestState = {
    stresses: {},
    activeStress: '',
    currentRunStress: ''
};