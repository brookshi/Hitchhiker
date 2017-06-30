import { User } from '../models/user';
import { Team } from '../models/team';

export interface DtoResUser extends User { }

export interface DtoResTeam extends Partial<Team> { }