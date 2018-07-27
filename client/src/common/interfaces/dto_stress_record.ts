import { StressRunResult } from './dto_stress_setting';

export interface DtoStressRecord {

    id: number;

    stressId: string;

    result: StressRunResult;

    createDate: Date;
}