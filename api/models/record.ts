import { Entity, PrimaryColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Collection } from './collection';

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

    @Column()
    url: string;

    @Column()
    method: string;

    @Column({ nullable: true })
    headers: string;

    @Column({ nullable: true, type: "text" })
    body: string;

    @Column({ nullable: true, type: "text" })
    test: string;

    @Column({ nullable: true })
    sort: number;

    @Column({ default: false })
    Invalid: boolean;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}