import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Record } from './record';
import { User } from './user';

@Entity()
export class RecordHistory {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Record, record => record.history)
    target: Record;

    @Column('json')
    record: Record;

    @ManyToOne(type => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    userId: string;

    @CreateDateColumn()
    createDate: Date;
}