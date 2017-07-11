import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Record } from './record';

@Entity()
export class RecordHistory {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Record, record => record.history)
    target: Record;

    @Column('json')
    record: Record;

    @CreateDateColumn()
    createDate: Date;
}