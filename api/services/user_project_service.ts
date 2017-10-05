import { DtoProjectQuit } from '../interfaces/dto_project_quit';
import { UserService } from './user_service';
import { ResObject } from '../common/res_object';
import { Message } from '../common/message';
import { ProjectService } from './project_service';
import { User } from '../models/user';
import { Project } from '../models/project';
import { Environment } from '../models/environment';
import { EnvironmentService } from './environment_service';
import * as _ from 'lodash';
import { ScheduleService } from './schedule_service';
import { DtoSchedule } from '../interfaces/dto_schedule';
import { Setting } from '../utils/setting';
import { StressService } from './stress_service';
import { DtoStress } from '../interfaces/dto_stress';

export class UserProjectService {

    static async quitProject(info: DtoProjectQuit): Promise<ResObject> {
        let user = await UserService.getUserById(info.userId, true);
        const projectIndex = user.projects.findIndex(v => v.id === info.projectId);
        if (projectIndex > -1) {
            user.projects.splice(projectIndex, 1);
        }
        await UserService.save(user);
        return { success: true, message: Message.projectQuitSuccess };
    }

    static async disbandProject(info: DtoProjectQuit): Promise<ResObject> {
        const project = await ProjectService.getProject(info.projectId, true, false, false, false);
        if (!project) {
            return { success: false, message: Message.projectNotExist };
        }
        if (project.owner.id !== info.userId) {
            return { success: false, message: Message.projectDisbandNeedOwner };
        }
        project.owner = undefined;
        await ProjectService.save(project);
        await ProjectService.delete(project.id);
        return { success: true, message: Message.projectDisbandSuccess };
    }

    static async getUserInfo(user: User): Promise<{ user: User, projects: _.Dictionary<Project>, environments: _.Dictionary<Environment[]>, schedules: _.Dictionary<DtoSchedule>, stresses: _.Dictionary<DtoStress>, defaultHeaders: string }> {
        const environments = _.groupBy(await EnvironmentService.getEnvironments(_.flatten(user.projects.map(t => t.environments.map(e => e.id)))), e => e.project.id);
        user.projects.forEach(t => t.environments = undefined);
        const projects = _.keyBy(user.projects, 'id');
        user.projects = undefined;
        const schedules = _.keyBy((await ScheduleService.getByUserId(user.id)).map(s => ScheduleService.toDto(s)), 'id');
        const stresses = _.keyBy((await StressService.getByUserId(user.id)).map(s => StressService.toDto(s)), 'id');
        return { user, projects, environments, schedules, stresses, defaultHeaders: Setting.instance.defaultHeaders };
    }
}