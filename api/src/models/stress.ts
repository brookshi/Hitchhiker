import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { NotificationMode } from '../common/enum/notification_mode';
import { StressRecord } from './stress_record';

@Entity()
export class Stress {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    collectionId: string;

    @Column({ nullable: true })
    environmentId: string;

    @Column()
    concurrencyCount: number;

    @Column()
    repeat: number;

    @Column()
    qps: number;

    @Column()
    timeout: number;

    @Column()
    keepAlive: boolean;

    @Column('json')
    requests: string[];

    @Column('int', { default: 2 })
    notification: NotificationMode;

    @Column()
    emails: string;

    @Column()
    ownerId: string;

    @OneToMany(_type => StressRecord, stressRecord => stressRecord.stress)
    stressRecords: StressRecord[];

    @Column({ nullable: true })
    lastRunDate: Date;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}