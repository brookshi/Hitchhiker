import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Record } from './record';
import { Mock } from './mock';
import { MockCollection } from './mock_collection';

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

    @ManyToOne(_type => Mock, mock => mock.id)
    mock: Mock;

    @ManyToOne(_type => MockCollection, mockCollection => mockCollection.id)
    mockCollection: MockCollection;
}