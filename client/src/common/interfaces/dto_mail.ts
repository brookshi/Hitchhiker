import { DtoError } from './dto_error';

export interface MailScheduleRecord {

    scheduleName: string;

    success: boolean;

    duration: number;

    runResults: MailRunResult[];
}

export interface MailRunResult {

    recordName: string;

    parameter: string;

    envName: string;

    tests: { [key: string]: boolean };

    duration: number;

    error?: DtoError;

    isSuccess: boolean;
}