import { StressMessageType } from '../common/stress_type';
import { RecordEx } from '../models/record';

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