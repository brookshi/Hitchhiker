import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Environment } from './environment';
import { Case } from './case';
import { User } from './user';
import { Team } from './team';

@Entity()
export class Collection {
    @PrimaryColumn()
    id: string;

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

    @ManyToOne(type => Team, team => team.collections)
    team: Team;

    @Column()
    isValid: boolean;

    @CreateDateColumn()
    createDate: Date;
}