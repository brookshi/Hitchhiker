import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { Project } from './project';
import { NotificationMode } from '../interfaces/notification_mode';
import { StressRecord } from './stress_record';

@Entity()
export class Stress {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    collectionId: string;

    @Column()
    concurrencyCount: string;

    @Column()
    totalCount: number;

    @Column()
    qps: number;

    @Column()
    timeout: number;

    @Column('json')
    excludeRecords: string[];

    @Column('int', { default: 2 })
    notification: NotificationMode;

    @Column()
    emails: string;

    @Column()
    ownerId: string;

    @OneToMany(type => StressRecord, stressRecord => stressRecord.stress)
    stressRecords: StressRecord[];

    @Column({ nullable: true })
    lastRunDate: Date;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}