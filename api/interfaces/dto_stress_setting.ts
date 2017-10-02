import { RunResult } from './dto_run_result';
import { StressMessageType, WorkerStatus } from '../common/stress_type';

export interface StressUser {

    id: string;
}

export interface StressRequest extends StressUser {

    type: StressMessageType;

    stressId: string;

    testCase: TestCase;
}

export interface TestCase {

    requestBodyList?: RequestBody[];

    totalCount: number;

    concurrencyCount: number;

    qps: number;

    timeout: number;
}

export interface RequestBody {

    id: string;

    name: string;

    param: string;

    method: string;

    url: string;

    body?: string;

    headers?: _.Dictionary<string>;

    tests?: string;
}

export interface WorkerInfo {

    addr: string;

    status: WorkerStatus;

    cpuNum: number;
}

export interface StressResponse {

    type: StressMessageType;

    workerInfos: WorkerInfo[];

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

    name: string;

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

    totalCount: number;

    doneCount: number;

    tps: number;

    reqProgress: StressReqProgress[];

    stressReqDuration: _.Dictionary<{ durations: Duration[], statistics?: StressResStatisticsTime }>;

    stressFailedResult: StressResFailedStatistics;
}