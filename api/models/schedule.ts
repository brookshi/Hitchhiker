import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Collection } from "./collection";
import { Environment } from "./environment";
import { Period } from "../interfaces/period";
import { NotificationMode } from "../interfaces/notification_mode";
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

    @Column({ type: 'int', default: 2 })
    notification: NotificationMode;

    @Column()
    emails: string;

    @Column()
    recordsOrder: string;

    @OneToMany(type => ScheduleRecord, scheduleRecord => scheduleRecord.schedule)
    ScheduleRecords: ScheduleRecord[];

    @JoinColumn()
    @OneToOne(type => User)
    owner: User;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}