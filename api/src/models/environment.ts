import { ManyToOne, OneToMany, Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Variable } from './variable';
import { Project } from './project';

@Entity()
export class Environment {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(_type => Variable, variable => variable.environment, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    variables: Variable[] = [];

    @ManyToOne(_type => Project, project => project.environments)
    project: Project;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}
