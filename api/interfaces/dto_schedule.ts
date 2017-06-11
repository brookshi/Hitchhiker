import { Period } from "./period";
import { NotificationMode } from "./notification_mode";
import { DtoScheduleRecord } from "./dto_schedule_record";

export interface DtoSchedule {

    id: string;

    name: string;

    collectionId: string;

    environmentId: string;

    period: Period;

    hour: number;

    notification: NotificationMode;

    emails: string;

    needOrder: boolean;

    recordsOrder: string;

    suspend: boolean;

    ScheduleRecords: DtoScheduleRecord[];

    ownerId: string;
}