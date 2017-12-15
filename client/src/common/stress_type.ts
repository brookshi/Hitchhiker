
export enum WorkerStatus {

    idle = 0,

    ready = 1,

    working = 2,

    finish = 3,

    down = 4,

    fileReady = 5,
}

export enum StressMessageType {

    hardware = 0,

    task = 1,

    start = 2,

    runResult = 3,

    stop = 4,

    status = 5,

    fileStart = 6,

    fileFinish = 7,

    init,

    close,

    wait,

    error,

    finish,

    noWorker
}