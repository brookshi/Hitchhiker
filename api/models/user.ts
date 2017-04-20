import { Environment } from './environment';
import { JoinColumn, OneToMany, Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { Team } from './team';

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

    @Column()
    isActive: boolean;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}