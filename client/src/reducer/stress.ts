import { LoginSuccessType } from '../action/user';
import * as _ from 'lodash';
import { StressTestState, stressDefaultValue } from '../state/stress';
import { DtoStress } from '../../../api/interfaces/dto_stress';
import { SaveStressType, ActiveStressType, DeleteStressType, RunStressFulfillType, StressChunkDataType, StresStatusType } from '../action/stress';

export function stressTestState(state: StressTestState = stressDefaultValue, action: any): StressTestState {
    switch (action.type) {
        case LoginSuccessType: {
            const stresses = action.value.result.stresses as _.Dictionary<DtoStress>;
            const stressIds = _.keys(stresses);
            const activeStress = stressIds.length > 0 ? (stressIds[0] || '') : '';
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
        case StresStatusType: {
            const { workerInfos, tasks, currentTask } = action.value;
            if (currentTask) {
                tasks.unshift(currentTask);
            }
            return {
                ...state,
                workerInfos: workerInfos,
                tasks: tasks,
                currentRunStress: currentTask
            };
        }
        case StressChunkDataType: {
            return {
                ...state,
                runState: action.value.data
            };
        }
        case RunStressFulfillType: {
            const stress = state.stresses[action.value.id];
            const stresses = Object.keys(action.value.data).length > 1 ? {
                ...state.stresses, [action.value.id]: {
                    ...stress,
                    stressRecords: [
                        action.value.data,
                        ...stress.stressRecords
                    ],
                    lastRunDate: new Date()
                }
            } : state.stresses;
            return {
                ...state,
                stresses,
                runState: undefined
            };
        }
        default:
            return state;
    }
}