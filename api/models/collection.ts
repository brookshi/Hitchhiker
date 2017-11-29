import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Record } from './record';
import { User } from './user';
import { Project } from './project';

@Entity()
export class Collection {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(type => Record, record => record.collection, {
        cascadeInsert: true
    })
    records: Record[];

    @Column('text', { nullable: true })
    commonPreScript: string;

    @Column({ default: false })
    reqStrictSSL: boolean;

    @Column({ default: false })
    reqFollowRedirect: boolean;

    @Column({ nullable: true })
    description: string;

    @JoinColumn()
    @OneToOne(type => User)
    owner: User;

    @ManyToOne(type => Project, project => project.collections)
    project: Project;

    @Column({ default: false })
    recycle: boolean;

    @Column({ default: true })
    public: boolean;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}