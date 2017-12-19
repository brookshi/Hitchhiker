import { User } from '../models/user';

export interface DtoResUser extends User { }

export interface ConsoleMsg {

    type: 'log' | 'info' | 'warn' | 'error' | any;

    message: string;
}