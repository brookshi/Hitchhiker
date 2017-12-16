import { RunResult } from './dto_run_result';
import { RecordEx } from '../models/record';
import { StressMessageType, WorkerStatus } from '../common/stress_type';

export interface StressUser {

    id: string;
}

export interface StressRequest extends StressUser {

    type: StressMessageType;

    stressId: string;

    stressName: string;

    testCase: TestCase;

    fileData: Buffer;
}

export interface TestCase {

    records: RecordEx[];

    envId: string;

    requestBodyList?: RequestBody[];

    envVariables: _.Dictionary<string>;

    repeat: number;

    concurrencyCount: number;

    qps: number;

    timeout: number;

    keepAlive: boolean;
}

export interface RequestBody {

    id: string;

    name: string;

    param: string;

    method: string;

    url: string;

    body?: string;

    headers?: _.Dictionary<string>;

    test?: string;

    prescript?: string;
}

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