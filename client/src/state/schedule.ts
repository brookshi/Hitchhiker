import { DtoSchedule } from '../../../api/interfaces/dto_schedule';

export interface ScheduleState {

    schedules: _.Dictionary<DtoSchedule>;

    activeSchedule: string;
}

export const scheduleDefaultValue: ScheduleState = {
    schedules: {},
    activeSchedule: ''
};