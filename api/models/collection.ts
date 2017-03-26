import { ConnectionManager } from '../services/connection_manager';
import * as shortid from 'shortid';
import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Record } from './record';
import { User } from './user';
import { Team } from './team';

@Entity()
export class Collection {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(type => Record, record => record.collection)
    records: Record[];

    @Column({ nullable: true })
    description: string;

    @JoinColumn()
    @OneToOne(type => User)
    owner: User;

    @ManyToOne(type => Team, team => team.collections)
    team: Team;

    @Column({ default: false })
    recycle: boolean;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    constructor(name: string, description: string, owner: User) {
        this.id = shortid.generate();
        this.name = name;
        this.description = description;
        this.owner = owner;
    }

    async save() {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Collection).persist(this);
    }
}