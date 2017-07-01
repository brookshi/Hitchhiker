import { User } from '../models/user';
import { Project } from '../models/project';

export interface DtoResUser extends User { }

export interface DtoResProject extends Partial<Project> { }