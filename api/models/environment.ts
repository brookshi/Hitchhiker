import { ManyToOne, OneToMany, Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Variable } from "./variable";
import { Team } from "./team";

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

    @ManyToOne(type => Team, team => team.environments)
    team: Team;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}
