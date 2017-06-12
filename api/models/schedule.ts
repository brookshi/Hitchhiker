import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Collection } from "./collection";
import { Environment } from "./environment";
import { Period } from "../../client/src/common/period";
import { NotificationMode } from "../../client/src/common/notification_mode";
import { ScheduleRecord } from "./schedule_record";
import { User } from "./user";

@Entity()
export class Schedule {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @ManyToOne(type => Collection)
    collection: Collection;

    @ManyToOne(type => Environment)
    environment: Environment;

    @Column({ type: 'int', default: 0 })
    period: Period;

    @Column()
    hour: number;

    @Column({ type: 'int', default: 2 })
    notification: NotificationMode;

    @Column()
    emails: string;

    @Column()
    needOrder: boolean;

    @Column()
    recordsOrder: string;

    @Column()
    suspend: boolean;

    @OneToMany(type => ScheduleRecord, scheduleRecord => scheduleRecord.schedule)
    ScheduleRecords: ScheduleRecord[];

    @JoinColumn()
    @OneToOne(type => User)
    owner: User;

    @Column()
    lastRunDate: number;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}