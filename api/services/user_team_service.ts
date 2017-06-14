import { DtoTeamQuit } from "../interfaces/dto_team_quit";
import { UserService } from "./user_service";
import { ResObject } from "../common/res_object";
import { Message } from "../common/message";
import { TeamService } from "./team_service";
import { User } from "../models/user";
import { Team } from "../models/team";
import { Environment } from "../models/environment";
import { EnvironmentService } from "./environment_service";
import * as _ from "lodash";
import { ScheduleService } from "./schedule_service";
import { DtoSchedule } from "../interfaces/dto_schedule";

export class UserTeamService {

    static async quitTeam(info: DtoTeamQuit): Promise<ResObject> {
        let user = await UserService.getUserById(info.userId, true);
        const teamIndex = user.teams.findIndex(v => v.id === info.teamId);
        if (teamIndex > -1) {
            user.teams.splice(teamIndex, 1);
        }
        await UserService.save(user);
        return { success: true, message: Message.teamQuitSuccess };
    }

    static async disbandTeam(info: DtoTeamQuit): Promise<ResObject> {
        const team = await TeamService.getTeam(info.teamId, true, false, false, false);
        if (!team) {
            return { success: false, message: Message.teamNotExist };
        }
        if (team.owner.id !== info.userId) {
            return { success: false, message: Message.teamDisbandNeedOwner };
        }
        team.owner = undefined;
        await TeamService.save(team);
        await TeamService.delete(team.id);
        return { success: true, message: Message.teamDisbandSuccess };
    }

    static async getUserInfo(user: User): Promise<{ user: User, teams: _.Dictionary<Team>, environments: _.Dictionary<Environment[]>, schedules: _.Dictionary<DtoSchedule> }> {
        const environments = _.groupBy(await EnvironmentService.getEnvironments(_.flatten(user.teams.map(t => t.environments.map(e => e.id)))), e => e.team.id);
        user.teams.forEach(t => t.environments = undefined);
        const teams = _.keyBy(user.teams, 'id');
        user.teams = undefined;
        const schedules = _.keyBy((await ScheduleService.getByUserId(user.id)).map(s => ScheduleService.toDto(s)), 'id');
        return { user, teams, environments, schedules };
    }
}