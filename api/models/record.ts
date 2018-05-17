import { OneToMany, Entity, PrimaryColumn, JoinColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { Collection } from './collection';
import { Header } from './header';
import { QueryString } from './query_string';
import { RecordCategory } from '../common/record_category';
import { DataMode } from '../common/data_mode';
import { BodyType } from '../common/string_type';
import { ParameterType, ReduceAlgorithmType } from '../common/parameter_type';
import { RecordDoc } from './record_doc';
import { RecordHistory } from './record_history';
import { ServerResponse } from 'http';
import { DtoAssert } from '../interfaces/dto_assert';
import { BodyFormData } from './body_form_data';

@Entity()
export class Record {

    @PrimaryColumn()
    id: string;

    @ManyToOne(type => Collection, collection => collection.records)
    collection: Collection;

    @JoinColumn()
    @OneToOne(type => RecordDoc, doc => doc.record, {
        cascadeInsert: true,
        cascadeRemove: true
    })
    doc: RecordDoc;

    @OneToMany(type => RecordHistory, history => history.target)
    history: RecordHistory[];

    @Column('json')
    assertInfos: _.Dictionary<DtoAssert[]>;

    @Column({ nullable: true, default: '' })
    pid: string;

    @Column('int', { default: 20 })
    category: RecordCategory;

    @Column()
    name: string;

    @Column({ length: 2000, nullable: true })
    url: string;

    @Column({ nullable: true, default: 'GET' })
    method: string;

    @OneToMany(type => QueryString, queryString => queryString.record, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    queryStrings: QueryString[] = [];

    @OneToMany(type => Header, header => header.record, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    headers: Header[] = [];

    @OneToMany(type => BodyFormData, form => form.record, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    formDatas: BodyFormData[] = [];

    @Column('mediumtext', { nullable: true })
    body: string;

    @Column('varchar', { nullable: true, length: 50 })
    bodyType: BodyType;

    @Column('text', { nullable: true })
    parameters: string;

    @Column('int', { default: 0 })
    reduceAlgorithm: ReduceAlgorithmType;

    @Column('int', { default: 0 })
    parameterType: ParameterType;

    @Column({ default: 1, type: 'int' })
    dataMode: DataMode;

    @Column('text', { nullable: true })
    prescript: string;

    @Column('text', { nullable: true })
    test: string;

    @Column('int', { nullable: true })
    sort: number;

    @Column({ nullable: true })
    version: number; // TODO: need increase for each changing

    @Column('text', { nullable: true })
    description: string;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    children: Record[] = [];
}

export class RecordEx extends Record {

    envId: string;

    envName: string;

    envVariables: _.Dictionary<string>;

    pid: string;

    vid: string;

    uid?: string;

    param: any;

    serverRes?: ServerResponse;

    trace?: (msg: string) => void;
}