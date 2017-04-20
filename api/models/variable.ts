import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Environment } from "./environment";

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

}