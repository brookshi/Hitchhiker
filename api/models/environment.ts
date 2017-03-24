import { Message } from '../common/message';
import { ConnectionManager } from '../services/connectionManager';
import * as shortid from 'shortid';
import { ManyToOne, OneToMany, Entity, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Variable } from "./variable";

@Entity()
export class Environment {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(type => Variable, variable => variable.envId)
    variables: Variable[] = [];

    @ManyToOne(type => User, user => user.environments)
    owner: User;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    constructor(name: string, variables: Variable[], owner: User) {
        this.id = shortid.generate();
        this.name = name;
        this.owner = owner;
        variables.forEach(v => {
            this.variables.push(new Variable(v.key, v.value, v.isActive, v.sort, this.id));
        });
    }

    async save() {
        const connection = await ConnectionManager.getInstance();

        await connection.getRepository(Environment).persist(this).catch(e => {
            throw new Error(Message.envCreateFailed);
        });
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

