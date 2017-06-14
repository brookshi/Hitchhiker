import { LoginSuccessType } from '../action/user';
import * as _ from 'lodash';
import { ScheduleState, scheduleDefaultValue } from '../state/schedule';
import { SaveScheduleType, ActiveScheduleType, DeleteScheduleType } from '../action/schedule';
import { DtoSchedule } from '../../../api/interfaces/dto_schedule';

export function scheduleState(state: ScheduleState = scheduleDefaultValue, action: any): ScheduleState {
    switch (action.type) {
        case LoginSuccessType: {
            const schedules = action.value.result.schedules as _.Dictionary<DtoSchedule>;
            const scheduleIds = _.keys(schedules);
            const activeSchedule = scheduleIds.length > 0 ? (scheduleIds[0] || '') : '';
            return { ...state, schedules, activeSchedule };
        }
        case SaveScheduleType: {
            const schedule = action.value.schedule as DtoSchedule;
            return { ...state, schedules: { ...state.schedules, [schedule.id]: schedule } };
        }
        case ActiveScheduleType: {
            return { ...state, activeSchedule: action.value };
        }
        case DeleteScheduleType: {
            const schedules = state.schedules;
            Reflect.deleteProperty(schedules, action.value.id);
            return { ...state, schedules: { ...schedules } };
        }
        default:
            return state;
    }
}