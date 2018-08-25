import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Schedule } from './schedule';
import { RunResult } from '../common/interfaces/dto_run_result';

@Entity()
export class ScheduleRecord {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_type => Schedule, schedule => schedule.scheduleRecords)
    schedule: Schedule;

    @Column()
    duration: number;

    @Column('json')
    result: { origin: Array<RunResult | _.Dictionary<RunResult>>, compare: Array<RunResult | _.Dictionary<RunResult>> };

    @Column()
    success: boolean;

    @Column()
    isScheduleRun: boolean;

    @Column({ default: () => `'1949-10-01'` })
    runDate: Date;

    @CreateDateColumn()
    createDate: Date;
}