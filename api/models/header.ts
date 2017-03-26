import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { User } from "./user";
import { Record } from "./record";

@Entity()
export class Header {
    @PrimaryColumn()
    id: string;

    @Column()
    key: string;

    @Column()
    value: string;

    @Column()
    isActive: boolean;

    @Column()
    sort: number;

    @ManyToOne(type => User, user => user.id)
    record: Record;
}