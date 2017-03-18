import { OneToMany, Entity, PrimaryColumn, Column, ManyToMany, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Collection } from './collection';
import { User } from './user';

@Entity()
export class Team {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    company: string;

    @Column()
    isPublic: string

    @ManyToMany(type => User, user => user.teams, {
        cascadeUpdate: true,
    })
    members: User[];

    @OneToMany(type => Collection, collection => collection.team)
    collections: Collection[];

    @Column()
    note: string;

    @Column()
    admin: string;

    @Column()
    isValid: boolean;

    @CreateDateColumn()
    createDate: Date;
}