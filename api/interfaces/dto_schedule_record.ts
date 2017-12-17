import { RunResult } from './dto_run_result';

export interface DtoScheduleRecord {

    id: number;

    scheduleId: string;

    duration: number;

    result: { origin: Array<RunResult | _.Dictionary<RunResult>>, compare: Array<RunResult | _.Dictionary<RunResult>> };

    success: boolean;

    isScheduleRun: boolean;

    runDate: Date;

    createDate: Date;
}