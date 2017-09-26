
export class StressInfo {

    type: string;

    stressId: string;

    stressSetting?: StressSetting;
}

export class StressSetting {

    totalCount: number;

    concurrencyCount: number;

    qps: number;

    timeout: number;
}