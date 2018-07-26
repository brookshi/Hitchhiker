import { RunResult } from '../../../api/src/interfaces/dto_run_result';

export interface ScheduleStatistics {

    id: string;

    key: string;

    runResults: Array<RunResult & { date: Date }>;

    name: string;

    env: string;

    param?: string;

    successNum: number;

    errorNum: number;

    total: number;

    minTime: number;

    maxTime: number;

    averageTime: number;

    lastStatus: boolean;
}