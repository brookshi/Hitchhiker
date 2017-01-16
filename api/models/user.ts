import { Table, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Table()
export class User
{
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}