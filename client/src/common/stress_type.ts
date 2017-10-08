
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

    wait = 8,

    error = 9,

    finish = 10
}