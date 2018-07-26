import { DtoSchedule } from '../../../api/src/interfaces/dto_schedule';
import { RunResult } from '../../../api/src/interfaces/dto_run_result';
import { ScheduleRecordsDisplayMode } from '../common/custom_type';
import * as _ from 'lodash';

export interface ScheduleState {

    schedules: _.Dictionary<DtoSchedule>;

    activeSchedule: string;

    runState: _.Dictionary<ScheduleRunState>;

    scheduleRecordsInfo: _.Dictionary<ScheduleRecordsInfo>;
}

export interface ScheduleRecordsInfo {

    pageNum: number;

    mode: ScheduleRecordsDisplayMode;

    excludeNotExist: boolean;
}

export interface ScheduleRunState {

    isRunning: boolean;

    consoleRunResults: RunResult[];
}

export const scheduleDefaultValue: ScheduleState = {
    schedules: {},
    activeSchedule: '',
    runState: {},
    scheduleRecordsInfo: {}
};