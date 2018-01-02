import { DtoSchedule } from '../../../api/interfaces/dto_schedule';
import { DtoScheduleRecord } from '../../../api/interfaces/dto_schedule_record';
import { RunResult } from '../../../api/interfaces/dto_run_result';

export interface ScheduleState {

    schedules: _.Dictionary<DtoSchedule>;

    activeSchedule: string;

    runState: _.Dictionary<ScheduleRunState>;

    scheduleRecordsInPages: _.Dictionary<ScheduleRecordsInPage>;
}

export interface ScheduleRecordsInPage {

    isLoading: boolean;

    records: DtoScheduleRecord[];

    pageNum: number;
}

export interface ScheduleRunState {

    isRunning: boolean;

    consoleRunResults: RunResult[];
}

export const scheduleDefaultValue: ScheduleState = {
    schedules: {},
    activeSchedule: '',
    runState: {},
    scheduleRecordsInPages: {}
};