import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Environment } from './environment';
import { Case } from './case';
import { User } from './user';

@Entity()
export class Collection
{
    @PrimaryColumn()
    id : string;

    @Column()
    name: string;

    @JoinColumn()
    @OneToOne(type => Environment)
    environment: Environment;

    @OneToMany(type => Case, caseItem => caseItem.collection)
    cases: Case[];

    @Column()
    comment: string;

    @OneToOne(type => User)
    @JoinColumn()
    owner: User;

    @Column()
    isValid: boolean;

    @CreateDateColumn()
    createDate: Date;
}