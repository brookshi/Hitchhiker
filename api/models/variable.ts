import * as shortid from 'shortid';
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Variable {
    @PrimaryColumn()
    id: string;

    @Column()
    key: string;

    @Column()
    value: string;

    @Column()
    isActive: boolean;

    @Column()
    sort: number;

    @Column()
    envId: string;

    constructor(key: string, value: string, isActive: boolean, sort: number, envId: string) {
        this.id = shortid.generate();
        this.key = key;
        this.value = value;
        this.isActive = isActive;
        this.sort = sort;
        this.envId = envId;
    }
}