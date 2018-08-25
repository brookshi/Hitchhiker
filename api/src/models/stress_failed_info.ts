import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class StressFailedInfo {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('longtext')
    info: string;
}