import { DtoError } from './dto_error';

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

    headers: { [key: string]: string };

    cookies: string[];

    host: string;
}