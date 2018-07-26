import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Record } from './record';
import { User } from './user';
import { Project } from './project';
import { DtoCommonSetting } from '../interfaces/dto_collection';

@Entity()
export class Collection {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(_type => Record, record => record.collection, {
        cascadeInsert: true
    })
    records: Record[];

    @Column('mediumtext', { nullable: true })
    commonPreScript: string;

    @Column({ default: false })
    reqStrictSSL: boolean;

    @Column({ default: false })
    reqFollowRedirect: boolean;

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

    @Column('json', { nullable: true })
    commonSetting: DtoCommonSetting;

    compatibleCommonPreScript = () => this.commonSetting ? (this.commonSetting.prescript || '') : (this.commonPreScript || '');

    commonTest = () => this.commonSetting ? (this.commonSetting.test || '') : '';

    commonHeaders = () => this.commonSetting ? (this.commonSetting.headers || []) : [];

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}