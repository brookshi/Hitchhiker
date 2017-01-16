import { Table, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Table()
export class Case
{
    @PrimaryColumn()
    id: string;

    @Column()
    collectionid: string;

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