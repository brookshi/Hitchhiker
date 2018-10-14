import { DtoProjectQuit } from '../common/interfaces/dto_project_quit';
import { UserService } from './user_service';
import { ResObject } from '../interfaces/res_object';
import { Message } from '../utils/message';
import { ProjectService } from './project_service';
import { User } from '../models/user';
import { EnvironmentService } from './environment_service';
import * as _ from 'lodash';
import { ScheduleService } from './schedule_service';
import { Setting } from '../utils/setting';
import { StressService } from './stress_service';
import { UserData } from '../interfaces/user_data';
import { UserCollectionService } from './user_collection_service';
import { DtoRecord } from '../common/interfaces/dto_record';
import { RecordService } from './record_service';
import { DtoCollection } from '../common/interfaces/dto_collection';
import { CollectionService } from './collection_service';
import { ProjectFiles, ProjectData } from '../common/interfaces/dto_project_data';
import { ProjectDataService } from './project_data_service';
import { MockCollectionService } from './mock_collection_service';
import { DtoMockCollection } from '../common/interfaces/dto_mock_collection';
import { DtoMock } from '../common/interfaces/dto_mock';
import { MockService } from './mock_service';

export class UserProjectService {

    static async quitProject(info: DtoProjectQuit): Promise<ResObject> {
        let user = await UserService.getUserById(info.userId, true);
        const projectIndex = user.projects.findIndex(v => v.id === info.projectId);
        if (projectIndex > -1) {
            user.projects.splice(projectIndex, 1);
        }
        await UserService.save(user);
        return { success: true, message: Message.get('projectQuitSuccess') };
    }

    static async disbandProject(info: DtoProjectQuit): Promise<ResObject> {
        const project = await ProjectService.getProject(info.projectId, true, false, false, false);
        if (!project) {
            return { success: false, message: Message.get('projectNotExist') };
        }
        if (project.owner.id !== info.userId) {
            return { success: false, message: Message.get('projectDisbandNeedOwner') };
        }
        project.owner = undefined;
        await ProjectService.save(project);
        await ProjectService.delete(project.id);
        return { success: true, message: Message.get('projectDisbandSuccess') };
    }

    static async getUserInfo(user: User): Promise<UserData> {

        const { collections, recordsList } = await UserCollectionService.getUserCollections(user.id);
        let records: _.Dictionary<_.Dictionary<DtoRecord>> = {};
        _.keys(recordsList).forEach(k => records[k] = _.chain(recordsList[k]).map(r => RecordService.toDto(r)).keyBy('id').value());

        const { mockCollections, mockList } = await UserCollectionService.getUserMockCollections(user.id);
        let mocks: _.Dictionary<_.Dictionary<DtoMock>> = {};
        _.keys(mockList).forEach(k => mocks[k] = _.chain(mockList[k]).map(r => MockService.toDto(r)).keyBy('id').value());

        const environments = _.groupBy(await EnvironmentService.getEnvironments(_.flatten(user.projects.map(t => t.environments.map(e => e.id)))), e => e.project.id);

        user.projects.forEach(t => t.environments = undefined);
        const projects = _.keyBy(user.projects, 'id');
        user.projects = undefined;

        const schedules = await ScheduleService.getByUserId(user.id);
        const scheduleDict = _.keyBy(schedules.map(s => ScheduleService.toDto(s)), 'id');

        const stressDict = _.keyBy((await StressService.getByUserId(user.id)).map(s => StressService.toDto(s)), 'id');

        const projectFiles: ProjectFiles = {
            globalJS: ProjectDataService.instance._gJsFiles,
            globalData: ProjectDataService.instance._gDataFiles,
            projectJS: _.pick(ProjectDataService.instance._pJsFiles, _.keys(projects)) as _.Dictionary<_.Dictionary<ProjectData>>,
            projectData: _.pick(ProjectDataService.instance._pDataFiles, _.keys(projects)) as _.Dictionary<_.Dictionary<ProjectData>>
        };

        return {
            collection: {
                collections: _.keyBy<DtoCollection>(collections.map(c => CollectionService.toDto(c)), 'id'),
                records
            },
            user,
            projects,
            environments,
            schedules: scheduleDict,
            schedulePageSize: Setting.instance.schedulePageSize,
            stresses: stressDict,
            mockCollections: {
                collections: _.keyBy<DtoMockCollection>(mockCollections.map(c => MockCollectionService.toDto(c)), 'id'),
                mocks
            },
            projectFiles,
            defaultHeaders: Setting.instance.defaultHeaders,
            syncInterval: Setting.instance.syncInterval,
            sync: Setting.instance.sync,
            enableUpload: Setting.instance.enableUpload
        };
    }
}