import { ConnectionManager } from '../services/connection_manager';
import * as shortid from 'shortid';
import { ManyToOne, OneToMany, Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Variable } from "./variable";
import { DtoVariable } from "../interfaces/dto_variable";
import { Team } from "./team";
import { DtoEnvironment } from "../interfaces/dto_environment";
import { StringUtil } from "../utils/string_util";

@Entity()
export class Environment {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(type => Variable, variable => variable.environment, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    variables: Variable[] = [];

    @ManyToOne(type => User, user => user.environments)
    owner: User;

    @ManyToOne(type => Team, team => team.environments)
    team: Team;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    constructor(name: string, variables?: DtoVariable[], owner?: User, id: string = undefined) {
        id = id || shortid.generate();
        this.id = id;
        this.name = name;
        this.owner = owner;
        if (variables) {
            variables.forEach(v => {
                this.variables.push(new Variable(v.key, v.value, v.isActive, v.sort, this));
            });
        }
    }

    static fromDto(dtoEnv: DtoEnvironment): Environment {
        const env = new Environment(dtoEnv.name);
        env.id = dtoEnv.id || StringUtil.generateUID();
        return env;
    }

    async update(name: string, variables: DtoVariable[]) {
        this.name = name;
        this.variables = [];
        if (variables) {
            variables.forEach(v => {
                this.variables.push(new Variable(v.key, v.value, v.isActive, v.sort, this));
            });
        }
        await this.save();
    }

    async save() {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Environment).persist(this);
    }

    get formatVariables(): { [key: string]: string } {
        let variables: { [key: string]: string } = {};
        this.variables.forEach(o => {
            if (o.isActive) {
                variables[o.key] = o.value;
            }
        });
        return variables;
    }
}

