import { LoginSuccessType, SyncUserDataSuccessType } from '../action/user';
import * as _ from 'lodash';
import { ScheduleState, scheduleDefaultValue } from '../state/schedule';
import { SaveScheduleType, ActiveScheduleType, DeleteScheduleType, RunScheduleType, RunScheduleFulfillType, ScheduleChunkDataType, SetScheduleRecordsModeType, SetScheduleRecordsPageType, SetScheduleRecordsExcludeNotExistType } from '../action/schedule';
import { DtoSchedule } from '../../../api/src/interfaces/dto_schedule';
import { GlobalVar } from '../utils/global_var';

export function scheduleState(state: ScheduleState = scheduleDefaultValue, action: any): ScheduleState {
    switch (action.type) {
        case LoginSuccessType:
        case SyncUserDataSuccessType: {
            GlobalVar.instance.schedulePageSize = action.value.result.schedulePageSize;
            const schedules = action.value.result.schedules as _.Dictionary<DtoSchedule>;
            const scheduleIds = _.keys(schedules);
            const activeSchedule = state.activeSchedule || (scheduleIds.length > 0 ? (scheduleIds[0] || '') : '');
            return { ...state, schedules, activeSchedule };
        }
        case SaveScheduleType: {
            const schedule = action.value.schedule as DtoSchedule;
            return { ...state, schedules: { ...state.schedules, [schedule.id]: schedule }, activeSchedule: schedule.id };
        }
        case ActiveScheduleType: {
            return { ...state, activeSchedule: action.value };
        }
        case DeleteScheduleType: {
            const schedules = { ...state.schedules };
            Reflect.deleteProperty(schedules, action.value);
            const activeSchedule = state.activeSchedule === action.value ? (_.keys(schedules).length > 0 ? (_.keys(schedules)[0] || '') : '') : state.activeSchedule;
            return { ...state, schedules, activeSchedule };
        }
        case RunScheduleType: {
            return {
                ...state,
                runState: {
                    ...state.runState,
                    [action.value]: {
                        isRunning: true,
                        consoleRunResults: []
                    }
                }
            };
        }
        case ScheduleChunkDataType: {
            return {
                ...state,
                runState: {
                    ...state.runState,
                    [action.value.id]: {
                        isRunning: true,
                        consoleRunResults: [
                            ...state.runState[action.value.id].consoleRunResults,
                            action.value.data
                        ]
                    }
                }
            };
        }
        case RunScheduleFulfillType: {
            const schedule = state.schedules[action.value.id];
            const schedules = Object.keys(action.value.data).length > 1 ? {
                ...state.schedules, [action.value.id]: {
                    ...schedule,
                    scheduleRecords: [
                        action.value.data,
                        ...schedule.scheduleRecords
                    ],
                    lastRunDate: new Date()
                }
            } : state.schedules;
            return {
                ...state,
                schedules,
                runState: {
                    ...state.runState,
                    [action.value.id]: {
                        isRunning: false, consoleRunResults: []
                    }
                }
            };
        }
        case SetScheduleRecordsPageType: {
            const { id, pageNum } = action.value;
            return {
                ...state,
                scheduleRecordsInfo: { ...state.scheduleRecordsInfo, [id]: { ...state.scheduleRecordsInfo[id], pageNum } }
            };
        }
        case SetScheduleRecordsModeType: {
            const { id, mode } = action.value;
            return {
                ...state,
                scheduleRecordsInfo: { ...state.scheduleRecordsInfo, [id]: { ...state.scheduleRecordsInfo[id], mode } }
            };
        }
        case SetScheduleRecordsExcludeNotExistType: {
            const { id, excludeNotExist } = action.value;
            return {
                ...state,
                scheduleRecordsInfo: { ...state.scheduleRecordsInfo, [id]: { ...state.scheduleRecordsInfo[id], excludeNotExist } }
            };
        }
        default:
            return state;
    }
}