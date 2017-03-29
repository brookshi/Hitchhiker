import { OneToOne, JoinColumn, OneToMany, Entity, PrimaryColumn, Column, ManyToMany, CreateDateColumn, JoinTable } from 'typeorm';
import { Collection } from './collection';
import { User } from './user';
import { DtoTeam } from "../interfaces/dto_team";
import * as shortid from 'shortid';
import { ConnectionManager } from "../services/connection_manager";

@Entity()
export class Team {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

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

    static fromDto(dtoTeam: DtoTeam): Team {
        let team = new Team();
        team.id = dtoTeam.id || shortid.generate();
        team.name = dtoTeam.name;

        team.members = [];
        if (dtoTeam.members) {
            dtoTeam.members.forEach(m => {
                const user = new User();
                user.id = m;
                team.members.push(user);
            });
        }

        team.collections = [];
        if (dtoTeam.collections) {
            dtoTeam.collections.forEach(c => {
                const collection = new Collection();
                collection.id = c;
                team.collections.push(collection);
            });
        }

        team.note = dtoTeam.note;
        const owner = new User();
        owner.id = dtoTeam.owner;
        team.owner = owner;

        return team;
    }

    async save() {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Team).persist(this);
    }
}