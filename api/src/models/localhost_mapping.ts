import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Project } from './project';

@Entity()
export class LocalhostMapping {
    @PrimaryColumn()
    id: string;

    @Column()
    userId: string;

    @Column({ default: 'localhost' })
    ip: string;

    @ManyToOne(_type => Project, project => project.localhosts)
    project: Project;
}