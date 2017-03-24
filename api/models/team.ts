import { OneToOne, JoinColumn, OneToMany, Entity, PrimaryColumn, Column, ManyToMany, UpdateDateColumn, CreateDateColumn, JoinTable } from 'typeorm';
import { Collection } from './collection';
import { User } from './user';

@Entity()
export class Team {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    company: string;

    @Column({ default: true })
    isPublic: boolean

    @JoinTable()
    @ManyToMany(type => User, user => user.teams)
    members: User[] = [];

    @OneToMany(type => Collection, collection => collection.team)
    collections: Collection[] = [];

    @Column({ nullable: true })
    note: string;

    @JoinColumn()
    @OneToOne(type => User)
    owner: User;

    @CreateDateColumn()
    createDate: Date;
}