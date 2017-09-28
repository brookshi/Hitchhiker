import { RunResult } from './dto_run_result';

export interface StressUser {

    id: string;
}

export interface StressRequest extends StressUser {

    type: StressMessageType;

    stressId: string;

    setting: StressSetting;
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

export interface StressSetting {

    totalCount: number;

    concurrencyCount: number;

    qps: number;

    timeout: number;
}

export enum WorkerStatus {

    idle = 0,

    ready = 1,

    working = 2,

    finish = 3,

    down = 4
}

export enum StressMessageType {

    hardware = 0,

    task = 1,

    start = 2,

    runResult = 3,

    stop = 4,

    status = 5,

    init = 6,

    close = 7,

    wait = 8
}

export interface StressMessage {

    status: WorkerStatus;

    code: StressMessageType;

    runResult: RunResult;

    cpuNum: number;
}