import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Period } from '../interfaces/period';
import { NotificationMode } from '../interfaces/notification_mode';
import { ScheduleRecord } from './schedule_record';

@Entity()
export class Schedule {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    collectionId: string;

    @Column({ nullable: true })
    environmentId: string;

    @Column({ default: false })
    needCompare: boolean;

    @Column({ nullable: true })
    compareEnvironmentId: string;

    @Column('int', { default: 0 })
    period: Period;

    @Column()
    hour: number;

    @Column('int', { default: 2 })
    notification: NotificationMode;

    @Column()
    emails: string;

    @Column()
    needOrder: boolean;

    @Column('text')
    recordsOrder: string;

    @Column()
    suspend: boolean;

    @OneToMany(type => ScheduleRecord, scheduleRecord => scheduleRecord.schedule)
    scheduleRecords: ScheduleRecord[];

    @Column()
    ownerId: string;

    @Column({ nullable: true })
    lastRunDate: Date;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}