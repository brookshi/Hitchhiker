import { NotificationMode } from './notification_mode';
import { DtoStressRecord } from './dto_stress_record';

export interface DtoStress {

    id: string;

    name: string;

    collectionId: string;

    concurrencyCount: string;

    totalCount: number;

    qps: number;

    timeout: number;

    excludeRecords: string[];

    notification: NotificationMode;

    emails?: string;

    ownerId: string;

    stressRecords: DtoStressRecord[];

    lastRunDate: Date;
}