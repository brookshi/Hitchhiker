import { OneToMany, Entity, PrimaryColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Collection } from './collection';
import { Header } from "./header";
import { RecordCategory } from "../common/record_category";
import { DataMode } from "../common/data_mode";
import { BodyType } from '../common/body_type';

@Entity()
export class Record {

    @PrimaryColumn()
    id: string;

    @ManyToOne(type => Collection, collection => collection.records)
    collection: Collection;

    @Column({ nullable: true, default: '' })
    pid: string;

    @Column('int', { default: 20 })
    category: RecordCategory;

    @Column()
    name: string;

    @Column({ nullable: true })
    url: string;

    @Column({ nullable: true, default: 'GET' })
    method: string;

    @OneToMany(type => Header, header => header.record, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    headers: Header[] = [];

    @Column('mediumtext', { nullable: true })
    body: string;

    @Column('varchar', { nullable: true, length: 50 })
    bodyType: BodyType;

    @Column({ default: 1, type: 'int' })
    dataMode: DataMode;

    @Column('text', { nullable: true })
    test: string;

    @Column('int', { nullable: true })
    sort: number;

    @Column({ nullable: true })
    version: number; // TODO: need increase for each changing

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    children: Record[] = [];
}