import { Table, PrimaryColumn, Column } from 'typeorm';

@Table()
export class Case
{
    @PrimaryColumn()
    id: string;

    @Column()
    pid: string;

    @Column()
    name: string;

    @Column()
    environment: string;

    @Column()
    url: string;

    @Column()
    method: string;

    @Column()
    headers: string;

    @Column("text")
    body: string;

    @Column()
    validation: string;

    @Column()
    sort: number;

    @Column()
    isvalid: boolean;

    @Column()
    createdtime: Date;

    @Column()
    modifiedtime: Date;
}