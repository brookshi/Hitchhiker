import * as shortid from 'shortid';
import { ConnectionManager } from '../services/connection_manager';
import { OneToMany, Entity, PrimaryColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Collection } from './collection';
import { Header } from "./header";
import { DtoRecord } from "../interfaces/dto_record";
import { RecordCategory } from "../common/record_category";
import { StringUtil } from "../utils/string_util";
import { DataMode } from "../common/data_mode";

@Entity()
export class Record {
    @PrimaryColumn()
    id: string;

    @ManyToOne(type => Collection, collection => collection.records)
    collection: Collection;

    @Column({ default: '' })
    pid: string;

    @Column({ type: 'int', default: 1 })
    category: RecordCategory;

    @Column()
    name: string;

    @Column({ nullable: true })
    url: string;

    @Column()
    method: string;

    @OneToMany(type => Header, header => header.record, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    headers: Header[] = [];

    @Column({ nullable: true, type: "text" })
    body: string;

    @Column({ default: 1, type: 'int' })
    dataMode: DataMode;

    @Column({ nullable: true, type: "text" })
    test: string;

    @Column({ nullable: true, type: 'int' })
    sort: number;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    children: Record[] = [];

    static fromDto(target: DtoRecord): Record {
        let collection = new Collection();
        collection.id = target.collectionId;

        let record = new Record();
        record.id = target.id;
        record.url = target.url;
        record.pid = target.pid;
        record.body = target.body;
        if (target.headers instanceof Array) {
            record.headers = target.headers.map(o => {
                let header = Header.fromDto(o);
                header.record = record;
                return header;
            });
        }
        record.test = target.test;
        record.sort = target.sort;
        record.method = target.method;
        record.collection = collection;
        record.name = target.name;
        record.category = target.category;
        return record;
    }

    async save() {
        if (!this.id) {
            this.id = shortid.generate();
        }
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Record).persist(this);
    }

    get formatHeaders(): { [key: string]: string } {
        let headers: { [key: string]: string } = {};
        this.headers.forEach(o => {
            if (o.isActive) {
                headers[o.key] = o.value;
            }
        });
        return headers;
    }

    clone(): Record {
        const target = <Record>Object.create(this);
        target.id = StringUtil.generateUID();
        target.headers = target.headers.map(h => h.clone());
        target.createDate = new Date();
        return target;
    }
}