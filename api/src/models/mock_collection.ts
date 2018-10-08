import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Project } from './project';
import { Mock } from './mock';
import { Header } from './header';

@Entity()
export class MockCollection {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(_type => Mock, mock => mock.collection, {
        cascadeInsert: true
    })
    mocks: Mock[];

    @Column('text', { nullable: true })
    description: string;

    @JoinColumn()
    @OneToOne(_type => User)
    owner: User;

    @ManyToOne(_type => Project, project => project.collections)
    project: Project;

    @Column({ default: false })
    recycle: boolean;

    @Column({ default: true })
    public: boolean;

    @OneToMany(_type => Header, header => header.mockCollection, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    headers: Header[];

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}