import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Record } from "./record";

@Entity()
export class Header {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    value: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int' })
    sort: number;

    @ManyToOne(type => Record, record => record.id)
    record: Record;
}