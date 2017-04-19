import { Collection } from "../models/collection";
import { User } from "../models/user";
import { Record } from "../models/record";
import { Team } from "../models/team";
import { Environment } from "../models/environment";
import { Header } from "../models/header";
import { Variable } from "../models/variable";

export interface DtoResCollection extends Collection { }

export interface DtoResRecord extends Record { }

export interface DtoResUser extends User { }

export interface DtoResTeam extends Team { }

export interface DtoResEnvironment extends Environment { }

export interface DtoResHeader extends Header { }

export interface DtoResVariable extends Variable { }