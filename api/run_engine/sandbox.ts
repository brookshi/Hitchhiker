import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { SessionService } from '../services/session_service';
import { UserVariableManager } from '../services/user_variable_manager';
import { Setting } from '../utils/setting';
import { ProjectDataService } from '../services/project_data_service';
import { ProjectData } from '../interfaces/dto_project_data';
import { ProjectFolderType } from '../common/string_type';

export class Sandbox {

    static defaultExport: any = 'export:impossiblethis:tropxe';

    private _allProjectJsFiles: _.Dictionary<ProjectData> = {};

    tests: _.Dictionary<boolean> = {};

    variables: any;

    exportObj = { content: Sandbox.defaultExport };

    constructor(private projectId: string, private vid: string, private envId: string, private envName: string) {
        this.initVariables();
        this._allProjectJsFiles = ProjectDataService.instance.getProjectAllJSFiles(projectId);
    }

    private initVariables() {
        this.variables = UserVariableManager.getVariables(this.vid, this.envId);
    }

    private getProjectFile(file: string, type: ProjectFolderType): string {
        return path.join(__dirname, `../global_data/${this.projectId}/${type}/${file}`);
    }

    require(lib: string) {
        if (Setting.instance.safeVM) {
            throw new Error('not support [require] in SafeVM mode, you can set it to false if you want to use [require].');
        }
        if (!this._allProjectJsFiles[lib]) {
            throw new Error(`no valid js lib named [${lib}], you should upload this lib first.`);
        }
        let libPath = this._allProjectJsFiles[lib].path;
        if (!fs.existsSync(libPath)) {
            throw new Error(`[${libPath}] doesnot exist.`);
        }
        const stat = fs.statSync(libPath);
        if (stat.isDirectory()) {
            const subFiles = fs.readdirSync(libPath);
            if (subFiles.length === 1 && fs.statSync(path.join(libPath, subFiles[0])).isDirectory()) {
                libPath = path.join(libPath, subFiles[0]);
            }
        }
        return require(libPath);
    }

    readFile(file: string): any {
        return this.readFileByReader(file, f => fs.readFileSync(f, 'utf8'));
    }

    readFileByReader(file: string, reader: (file: string) => any): any {
        if (ProjectDataService.instance._pDataFiles[this.projectId] &&
            ProjectDataService.instance._pDataFiles[this.projectId][file]) {
            return reader(ProjectDataService.instance._pDataFiles[this.projectId][file].path);
        }
        if (ProjectDataService.instance._gDataFiles[file]) {
            return reader(ProjectDataService.instance._gDataFiles[file].path);
        }
        throw new Error(`${file} not exists.`);
    }

    saveFile(file: string, content: string, replaceIfExist: boolean = true) {
        ProjectDataService.instance.saveDataFile(this.projectId, file, content, replaceIfExist);
    }

    removeFile(file: string) {
        ProjectDataService.instance.removeFile(ProjectDataService.dataFolderName, this.projectId, file);
    }

    setEnvVariable(key: string, value: any) {
        this.variables[key] = value;
    }

    getEnvVariable(key: string) {
        return this.variables[key];
    }

    removeEnvVariable(key: string) {
        Reflect.deleteProperty(this.variables, key);
    }

    get environment() {
        return this.envName;
    }

    export(obj: any) {
        this.exportObj.content = obj;
    };
}