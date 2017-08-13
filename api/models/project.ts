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
    @ManyToMany(type => User, user => user.projects)
    members: User[] = [];

    @OneToMany(type => LocalhostMapping, mapping => mapping.project)
    localhosts: LocalhostMapping[];

    @OneToMany(type => Collection, collection => collection.project)
    collections: Collection[] = [];

    @OneToMany(type => Environment, environment => environment.project)
    environments: Environment[] = [];

    @Column({ nullable: true })
    note: string;

    @Column({ default: false })
    isMe: boolean;

    @JoinColumn()
    @OneToOne(type => User)
    owner: User;

    @CreateDateColumn()
    createDate: Date;
}