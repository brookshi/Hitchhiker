import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Record } from './record';
import { User } from './user';
import { Team } from './team';

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

    @Column({ nullable: true })
    description: string;

    @JoinColumn()
    @OneToOne(type => User)
    owner: User;

    @ManyToOne(type => Team, team => team.collections)
    team: Team;

    @Column({ default: false })
    recycle: boolean;

    @Column({ default: true })
    public: boolean;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}