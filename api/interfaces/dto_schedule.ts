import { DtoScheduleRecord } from './dto_schedule_record';
import { Period, TimerType } from './period';
import { NotificationMode } from './notification_mode';

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

    needOrder: boolean;

    recordsOrder: string;

    suspend: boolean;

    scheduleRecords: DtoScheduleRecord[];

    ownerId: string;

    lastRunDate?: Date;
}