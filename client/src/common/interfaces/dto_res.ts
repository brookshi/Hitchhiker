import { DtoProject } from './dto_project';

export interface DtoResUser {

    id: string;

    name: string;

    password: string;

    email: string;

    projects: DtoProject[];

    isActive: boolean;

    isTemp: boolean;

    createDate: Date;

    updateDate: Date;
}

export interface ConsoleMsg {

    time: Date;

    type: 'log' | 'info' | 'warn' | 'error' | any;

    message: string;

    custom: boolean;
}