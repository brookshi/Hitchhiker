import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Record } from './record';
import { Mock } from './mock';

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

    @ManyToOne(_type => Record, record => record.id)
    record: Record;

    @ManyToOne(_type => Mock, mock => mock.id)
    mock: Mock;
}