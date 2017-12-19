import { DtoError } from './dto_error';
import { Duration } from './dto_stress_setting';
import { ConsoleMsg } from "./dto_res";

export interface RunResult {

    id: string;

    envId: string;

    param?: string;

    error?: DtoError;

    body: any;

    tests: { [key: string]: boolean };

    variables: {};

    export: {};

    status: number;

    statusMessage: string;

    elapsed: number;

    duration?: Duration;

    headers: { [key: string]: string | string[] };

    cookies: string[];

    host: string;

    consoleMsgQueue: ConsoleMsg[];
}