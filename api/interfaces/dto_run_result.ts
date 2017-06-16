import { DTOError } from './dto_error';

export interface RunResult {

    id: string;

    envId: string;

    error: DTOError;

    body: any;

    tests: { [key: string]: boolean };

    status: number;

    statusMessage: string;

    elapsed: number;

    headers: { [key: string]: string };

    cookies: string[];

    host: string;
}