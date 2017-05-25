import { DtoTeamQuit } from "../interfaces/dto_team_quit";
import { UserService } from "./user_service";
import { ResObject } from "../common/res_object";
import { Message } from "../common/message";
import { TeamService } from "./team_service";

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
}