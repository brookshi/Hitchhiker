import { Entity, PrimaryColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Collection } from './collection';

@Entity()
export class Case
{
    @PrimaryColumn()
    id: string;

    @ManyToOne(type => Collection, collection => collection.cases)
    collection: Collection;

    @Column()
    pid: string;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column()
    method: string;

    @Column()
    headers: string;

    @Column("text")
    body: string;

    @Column("text")
    test: string;

    @Column()
    sort: number;

    @Column()
    isValid: boolean;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}