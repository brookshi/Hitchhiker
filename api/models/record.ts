import * as shortid from 'shortid';
import { ConnectionManager } from '../services/connection_manager';
import { OneToMany, Entity, PrimaryColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Collection } from './collection';
import { Header } from "./header";
import { DtoRecord } from "../interfaces/dto_record";

@Entity()
export class Record {
    @PrimaryColumn()
    id: string;

    @ManyToOne(type => Collection, collection => collection.records)
    collection: Collection;

    @Column()
    pid: string;

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

    @Column({ nullable: true, type: "text" })
    test: string;

    @Column({ nullable: true, type: 'int' })
    sort: number;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    static fromDto(target: DtoRecord): Record {
        let collection = new Collection();
        collection.id = target.collectionId;

        let record = new Record();
        record.id = target.id;
        record.url = target.url;
        record.pid = target.pid;
        record.body = target.body;
        record.headers = target.headers.map(o => {
            let header = Header.fromDto(o);
            header.record = record;
            return header;
        });
        record.test = target.test;
        record.sort = target.sort;
        record.method = target.method;
        record.collection = collection;
        record.name = target.name;
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
}