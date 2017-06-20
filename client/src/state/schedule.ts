import { DtoSchedule } from '../../../api/interfaces/dto_schedule';
import { RunResult } from '../../../api/interfaces/dto_run_result';

export interface ScheduleState {

    schedules: _.Dictionary<DtoSchedule>;

    activeSchedule: string;

    isRunning: boolean;

    consoleRunResults: RunResult[];
}

export const scheduleDefaultValue: ScheduleState = {
    schedules: {},
    activeSchedule: '',
    isRunning: false,
    consoleRunResults: []
};