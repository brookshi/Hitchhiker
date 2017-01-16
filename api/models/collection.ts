import { Table, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Environment } from './environment';

@Table()
export class Collection
{
    @PrimaryColumn()
    id : string;

    @Column()
    name: string;

    @JoinColumn()
    @OneToOne(type => Environment)
    environment: Environment;

    @Column()
    comment: string;

    @Column()
    owner: string;

    @Column()
    isValid: boolean;

    @CreateDateColumn()
    createDate: Date;
}