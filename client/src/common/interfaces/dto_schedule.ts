import { DtoScheduleRecord } from './dto_schedule_record';
import { Period, TimerType } from '../enum/period';
import { NotificationMode, MailMode } from '../enum/notification_mode';

export interface DtoSchedule {

    id: string;

    name: string;

    collectionId: string;

    environmentId: string;

    needCompare: boolean;

    compareEnvironmentId: string;

    timer: TimerType;

    period: Period;

    hour: number;

    notification: NotificationMode;

    emails?: string;

    mailMode: MailMode;

    mailIncludeSuccessReq: boolean;

    needOrder: boolean;

    recordsOrder: string;

    suspend: boolean;

    scheduleRecords: DtoScheduleRecord[];

    ownerId: string;

    lastRunDate?: Date;

    recordCount: number;
}