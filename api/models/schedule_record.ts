import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Schedule } from "./schedule";

@Entity()
export class ScheduleRecord {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Schedule, schedule => schedule.scheduleRecords)
    schedule: Schedule;

    @Column()
    duration: number;

    @Column({ type: 'text' })
    result: string;

    @Column()
    success: boolean;

    @Column()
    isScheduleRun: boolean;

    @CreateDateColumn()
    createDate: Date;
}