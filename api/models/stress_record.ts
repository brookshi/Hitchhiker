import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Schedule } from './schedule';
import { RunResult } from '../interfaces/dto_run_result';
import { Stress } from './stress';
import { StressResTime, StressResStatus } from '../interfaces/dto_stress_setting';

@Entity()
export class StressRecord {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Stress, stress => stress.stressRecords)
    stress: Stress;

    @Column('json')
    resTime: StressResTime;

    @Column('json')
    resStatus: StressResStatus;

    @Column()
    tps: number;

    @CreateDateColumn()
    createDate: Date;
}