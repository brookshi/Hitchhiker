import { OneToMany, Entity, PrimaryColumn, JoinColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Header } from './header';
import { QueryString } from './query_string';
import { MockMode } from '../common/enum/mock_mode';
import { DataMode } from '../common/enum/data_mode';
import { BodyFormData } from './body_form_data';
import { MockCollection } from './mock_collection';
import { RecordCategory } from '../common/enum/record_category';

@Entity()
export class Mock {

    @PrimaryColumn()
    id: string;

    @Column({ nullable: true, default: '' })
    pid: string;

    @ManyToOne(_type => MockCollection, collection => collection.mocks)
    collection: MockCollection;

    @Column('int', { default: 20 })
    category: RecordCategory;

    @Column()
    name: string;

    @Column({ nullable: true, default: 'GET' })
    method: string;

    @Column({ length: 2000, nullable: true })
    url: string;

    @Column('int', { default: 1 })
    mode: MockMode;

    @OneToMany(_type => QueryString, queryString => queryString.mock, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    queryStrings: QueryString[] = [];

    @OneToMany(_type => Header, header => header.mock, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    headers: Header[] = [];

    @OneToMany(_type => BodyFormData, form => form.record, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    formDatas: BodyFormData[] = [];

    @Column('mediumtext', { nullable: true })
    body: string;

    @Column({ default: 1, type: 'int' })
    dataMode: DataMode;

    @Column('mediumtext', { nullable: true })
    res: string;

    @Column('int', { nullable: true })
    sort: number;

    @Column('text', { nullable: true })
    description: string;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    children: Mock[] = [];
}