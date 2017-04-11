import { OneToOne, JoinColumn, OneToMany, Entity, PrimaryColumn, Column, ManyToMany, CreateDateColumn, JoinTable } from 'typeorm';
import { Collection } from './collection';
import { User } from './user';
import { DtoTeam } from "../interfaces/dto_team";
import { ConnectionManager } from "../services/connection_manager";
import { Environment } from "./environment";
import { StringUtil } from "../utils/string_util";

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

    @OneToMany(type => Environment, environment => environment.team)
    environments: Environment[] = [];

    @Column({ nullable: true })
    note: string;

    @JoinColumn()
    @OneToOne(type => User)
    owner: User;

    @CreateDateColumn()
    createDate: Date;

    constructor(id: string) {
        this.id = id;
    }

    static fromDto(dtoTeam: DtoTeam): Team {
        let team = new Team(dtoTeam.id || StringUtil.generateUID());
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