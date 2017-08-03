import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { RecordDoc } from './record_doc';
import { User } from './user';

@Entity()
export class RecordDocHistory {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => RecordDoc, doc => doc.history)
    target: RecordDoc;

    @Column('json')
    doc: RecordDoc;

    @ManyToOne(type => User)
    user: User;

    @CreateDateColumn()
    createDate: Date;
}