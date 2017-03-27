import * as shortid from 'shortid';
import { ConnectionManager } from '../services/connection_manager';
import { OneToMany, Entity, PrimaryColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Collection } from './collection';
import { Header } from "./header";

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

    @Column({ nullable: true })
    sort: number;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    static clone(target: Record): Record {
        let r = new Record();
        r.url = target.url;
        r.body = target.body;
        r.headers = target.headers;
        r.test = target.test;
        r.sort = target.sort;
        r.method = target.method;
        r.collection = target.collection;
        r.name = target.name;
        return r;
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