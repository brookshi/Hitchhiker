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

export interface StressResTime {

    dns: number;

    connect: number;

    request: number;

    high: number;

    low: number;

    p50: number;

    p75: number;

    p90: number;

    p95: number;
}

export interface StressResStatus {

    success: number;

    m500: number;

    testFailed: number;

    noRes: number;

    timeout: number;
}