import * as shortid from 'shortid';
import { Message } from '../common/message';
import { ConnectionManager } from '../services/connectionManager';
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

    @OneToMany(type => Header, header => header.recordId)
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

    async save() {
        if (!this.id) {
            this.id = shortid.generate();
        }
        const connection = await ConnectionManager.getInstance();

        await connection.getRepository(Record).persist(this).catch(e => {
            throw new Error(Message.userCreateFailed);
        });
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