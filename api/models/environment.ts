import { ConnectionManager } from '../services/connection_manager';
import * as shortid from 'shortid';
import { ManyToOne, OneToMany, Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Variable } from "./variable";

@Entity()
export class Environment {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(type => Variable, variable => variable.envId, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    variables: Variable[] = [];

    @ManyToOne(type => User, user => user.environments)
    owner: User;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    constructor(name: string, variables: Variable[], owner: User, id: string = undefined) {
        this.id = id || shortid.generate();
        this.name = name;
        this.owner = owner;
        if (variables) {
            variables.forEach(v => {
                this.variables.push(new Variable(v.key, v.value, v.isActive, v.sort, this.id));
            });
        }
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

