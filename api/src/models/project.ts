import { OneToOne, JoinColumn, OneToMany, Entity, PrimaryColumn, Column, ManyToMany, CreateDateColumn, JoinTable } from 'typeorm';
import { Collection } from './collection';
import { LocalhostMapping } from './localhost_mapping';
import { User } from './user';
import { Environment } from './environment';

@Entity()
export class Project {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @JoinTable()
    @ManyToMany(_type => User, user => user.projects)
    members: User[] = [];

    @JoinTable()
    @OneToMany(_type => LocalhostMapping, mapping => mapping.project)
    localhosts: LocalhostMapping[];

    @OneToMany(_type => Collection, collection => collection.project)
    collections: Collection[] = [];

    @OneToMany(_type => Environment, environment => environment.project)
    environments: Environment[] = [];

    @Column('text', { nullable: true })
    globalFunction: string;

    @Column({ nullable: true })
    note: string;

    @Column({ default: false })
    isMe: boolean;

    @JoinColumn()
    @OneToOne(_type => User)
    owner: User;

    @CreateDateColumn()
    createDate: Date;
}