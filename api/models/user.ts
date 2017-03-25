import { Environment } from './environment';
import * as shortid from 'shortid';
import { JoinColumn, OneToMany, Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { Team } from './team';
import { ConnectionManager } from "../services/connection_manager";

@Entity()
export class User {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @ManyToMany(type => Team, team => team.members, {
        cascadeUpdate: true,
        cascadeInsert: true
    })
    teams: Team[] = [];

    @JoinColumn()
    @OneToMany(type => Environment, env => env.owner)
    environments: Environment[] = [];

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    constructor(name: string, email: string, password: string) {
        this.name = name;
        this.email = email;
        this.password = password;//TODO: md5, StringUtil.md5(password);
        this.id = shortid.generate();
    }

    async save() {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(User).persist(this);
    }
}