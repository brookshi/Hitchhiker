import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Record } from './record';

@Entity()
export class Header {
    @PrimaryColumn()
    id: string;

    @Column({ nullable: true })
    key: string;

    @Column('text', { nullable: true })
    value: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isFav: boolean;

    @Column()
    sort: number;

    @Column('text', { nullable: true })
    description: string;

    @ManyToOne(_type => Record, record => record.id)
    record: Record;
}