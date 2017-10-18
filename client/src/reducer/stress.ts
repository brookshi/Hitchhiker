import { LoginSuccessType, SyncUserDataSuccessType } from '../action/user';
import * as _ from 'lodash';
import { StressTestState, stressDefaultValue } from '../state/stress';
import { DtoStress } from '../../../api/interfaces/dto_stress';
import { SaveStressType, ActiveStressType, DeleteStressType, RunStressFulfillType, StressChunkDataType, StressStatusType } from '../action/stress';

export function stressTestState(state: StressTestState = stressDefaultValue, action: any): StressTestState {
    switch (action.type) {
        case LoginSuccessType:
        case SyncUserDataSuccessType: {
            const stresses = action.value.result.stresses as _.Dictionary<DtoStress>;
            const stressIds = _.keys(stresses);
            const activeStress = state.activeStress || (stressIds.length > 0 ? (stressIds[0] || '') : '');
            return { ...state, stresses, activeStress };
        }
        case SaveStressType: {
            const stress = action.value.stress as DtoStress;
            return { ...state, stresses: { ...state.stresses, [stress.id]: stress }, activeStress: stress.id };
        }
        case ActiveStressType: {
            return { ...state, activeStress: action.value };
        }
        case DeleteStressType: {
            const stresses = { ...state.stresses };
            Reflect.deleteProperty(stresses, action.value);
            const activeStress = state.activeStress === action.value ? (_.keys(stresses).length > 0 ? (_.keys(stresses)[0] || '') : '') : state.activeStress;
            return { ...state, stresses, activeStress };
        }
        case StressStatusType: {
            const { workerInfos, tasks, currentTask, currentStressId } = action.value;
            if (currentTask) {
                tasks.unshift(currentStressId);
            }
            return {
                ...state,
                workerInfos: workerInfos,
                tasks: tasks,
                currentRunStressName: currentTask,
                currentRunStressId: currentStressId
            };
        }
        case StressChunkDataType: {
            return {
                ...state,
                runState: action.value.data
            };
        }
        case RunStressFulfillType: {
            const stressId = action.value.currentStressId;
            const stress = state.stresses[stressId];
            if (!stress) {
                return state;
            }
            const stresses = {
                ...state.stresses, [stressId]: {
                    ...stress,
                    stressRecords: [
                        {
                            stressId,
                            result: action.value.data,
                            createDate: new Date()
                        },
                        ...stress.stressRecords
                    ],
                    lastRunDate: new Date()
                }
            };
            return {
                ...state,
                stresses,
                runState: undefined,
                tasks: action.value.tasks,
                currentRunStressName: '',
                currentRunStressId: ''
            };
        }
        default:
            return state;
    }
}