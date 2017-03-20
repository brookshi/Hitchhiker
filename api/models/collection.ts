import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Environment } from './environment';
import { Record } from './record';
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

    @OneToMany(type => Record, record => record.collection)
    records: Record[];

    @Column({ nullable: true })
    comment: string;

    @JoinColumn()
    @OneToOne(type => User)
    owner: User;

    @ManyToOne(type => Team, team => team.collections)
    team: Team;

    @Column({ default: false })
    Invalid: boolean;

    @CreateDateColumn()
    createDate: Date;
}