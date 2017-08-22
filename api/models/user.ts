import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { Project } from './project';

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

    @ManyToMany(type => Project, project => project.members)
    projects: Project[] = [];

    @Column()
    isActive: boolean;

    @Column({ default: false })
    isTemp: boolean;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}