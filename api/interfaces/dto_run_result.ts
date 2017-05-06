import { DtoHeader } from "../interfaces/dto_header";

export interface RunResult {

    body: any;

    tests: { [key: string]: boolean };

    status: number;

    statusMessage: string;

    elapsed: number;

    headers: DtoHeader[];

    cookies: string;
}