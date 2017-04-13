import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Environment } from "./environment";
import { DtoVariable } from "../interfaces/dto_variable";

@Entity()
export class Variable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    value: string;

    @Column({ default: false })
    isActive: boolean;

    @Column({ type: 'int' })
    sort: number;

    @ManyToOne(type => Environment, env => env.variables)
    environment: Environment;

    constructor(key: string, value: string, isActive: boolean, sort: number, env?: Environment) {
        this.key = key;
        this.value = value;
        this.isActive = isActive;
        this.sort = sort;
        this.environment = env;
    }

    static fromDto(dtoVariable: DtoVariable) {
        return new Variable(
            dtoVariable.key,
            dtoVariable.value,
            dtoVariable.isActive,
            dtoVariable.sort
        );
    }
}