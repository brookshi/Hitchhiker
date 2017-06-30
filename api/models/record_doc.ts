import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Record } from './record';
import { RecordDocHistory } from './record_doc_history';

@Entity()
export class RecordDoc {

    @PrimaryColumn()
    id: string;

    @OneToOne(type => Record, record => record.doc)
    record: Record;

    @OneToMany(type => RecordDocHistory, history => history.target)
    history: RecordDocHistory[];

    @Column({ nullable: true })
    version: number; // TODO: need increase for each changing

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}