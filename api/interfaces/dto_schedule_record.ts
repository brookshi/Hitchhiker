export interface DtoScheduleRecord {

    id: number;

    scheduleId: string;

    duration: number;

    result: string;

    success: boolean;

    isScheduleRun: boolean;

    createDate: Date;
}