import { User } from '../models/user';

export interface DtoResUser extends User { }

export interface ConsoleMsg {

    time: Date;

    type: 'log' | 'info' | 'warn' | 'error' | any;

    message: string;
}