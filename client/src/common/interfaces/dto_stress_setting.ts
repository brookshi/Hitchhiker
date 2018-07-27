import { RunResult } from './dto_run_result';
import { StressMessageType, WorkerStatus } from '../enum/stress_type';
import * as _ from 'lodash';

export interface WorkerInfo {

    addr: string;

    status: WorkerStatus;

    cpuNum: number;
}

export interface StressResponse {

    type: StressMessageType;

    workerInfos: WorkerInfo[];

    tasks: string[];

    currentTask?: string;

    currentStressId?: string;

    data?: any;
}

export interface StressMessage {

    status: WorkerStatus;

    type: StressMessageType;

    runResult: RunResult;

    cpuNum: number;
}

export interface Duration {

    dns: number;

    connect: number;

    request: number;
}

export interface StressReqProgress {

    id: string;

    num: number;
}

export interface StressResStatisticsTime {

    averageDns: number;

    averageConnect: number;

    averageRequest: number;

    high: number;

    low: number;

    p50: number;

    p75: number;

    p90: number;

    p95: number;

    stddev: number;
}

export interface StressResFailedInfo {

    testFailed: _.Dictionary<RunResult[]>;

    noRes: _.Dictionary<RunResult[]>;

    m500: _.Dictionary<RunResult[]>;
}

export interface StressResFailedStatistics {

    testFailed: _.Dictionary<number>;

    noRes: _.Dictionary<number>;

    m500: _.Dictionary<number>;
}

export interface StressRunResult {

    names: _.Dictionary<string>;

    totalCount: number;

    doneCount: number;

    tps: number;

    reqProgress: StressReqProgress[];

    stressReqDuration: _.Dictionary<{ durations: Duration[], statistics?: StressResStatisticsTime }>;

    stressFailedResult: StressResFailedStatistics;
}