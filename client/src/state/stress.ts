import { DtoStress } from '../../../api/src/interfaces/dto_stress';
import { StressRunResult, WorkerInfo } from '../../../api/src/interfaces/dto_stress_setting';
import * as _ from 'lodash';

export interface StressTestState {

    stresses: _.Dictionary<DtoStress>;

    activeStress: string;

    currentRunStressName: string;

    currentRunStressId: string;

    workerInfos: WorkerInfo[];

    tasks: string[];

    runState?: StressRunResult;
}

export const stressDefaultValue: StressTestState = {
    stresses: {},
    activeStress: '',
    currentRunStressId: '',
    currentRunStressName: '',
    workerInfos: [],
    tasks: []
};