import { DtoStress } from '../../../api/interfaces/dto_stress';
import { StressRunResult, WorkerInfo } from '../../../api/interfaces/dto_stress_setting';

export interface StressTestState {

    stresses: _.Dictionary<DtoStress>;

    activeStress: string;

    currentRunStress: string;

    workerInfos: WorkerInfo[];

    tasks: string[];

    runState?: StressRunResult;
}

export const stressDefaultValue: StressTestState = {
    stresses: {},
    activeStress: '',
    currentRunStress: '',
    workerInfos: [],
    tasks: []
};