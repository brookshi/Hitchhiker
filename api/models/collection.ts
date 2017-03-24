import { Message } from '../common/message';
import { ConnectionManager } from '../services/connectionManager';
import { ResObject } from '../common/res_object';
import * as shortid from 'shortid';
import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
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

    constructor(name: string, description: string) {
        this.id = shortid.generate();
        this.name = name;
        this.description = description;
    }

    async save() {
        const connection = await ConnectionManager.getInstance();

        await connection.getRepository(Collection).persist(this).catch(e => {
            throw new Error(Message.userCreateFailed);
        });
    }
}