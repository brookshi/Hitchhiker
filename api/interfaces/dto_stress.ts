import { NotificationMode } from './notification_mode';
import { DtoStressRecord } from './dto_stress_record';

export interface DtoStress {

    id: string;

    name: string;

    collectionId: string;

    environmentId: string;

    concurrencyCount: number;

    repeat: number;

    qps: number;

    timeout: number;

    keepAlive: boolean;

    requests: string[];

    notification: NotificationMode;

    emails?: string;

    ownerId: string;

    stressRecords: DtoStressRecord[];

    lastRunDate?: Date;
}