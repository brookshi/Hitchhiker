import { RunResult } from '../../../api/interfaces/dto_run_result';

export interface ScheduleStatistics {

    id: string;

    runResults: Array<RunResult & { date: Date }>;

    name: string;

    param?: string;

    successNum: number;

    errorNum: number;

    total: number;

    minTime: number;

    maxTime: number;

    averageTime: number;

    lastStatus: boolean;
}