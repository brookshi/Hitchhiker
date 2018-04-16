import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Record } from './record';

@Entity()
export class BodyFormData {
    @PrimaryColumn()
    id: string;

    @Column({ nullable: true })
    key: string;

    @Column('text', { nullable: true })
    value: string;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    sort: number;

    @Column('text', { nullable: true })
    description: string;

    @ManyToOne(type => Record, record => record.id)
    record: Record;
}