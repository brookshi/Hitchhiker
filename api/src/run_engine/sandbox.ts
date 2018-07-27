import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { UserVariableManager } from '../services/user_variable_manager';
import { Setting } from '../utils/setting';
import { ProjectDataService } from '../services/project_data_service';
import { ProjectData } from '../common/interfaces/dto_project_data';
import { Record } from '../models/record';
import { ConsoleMsg } from '../common/interfaces/dto_res';
import { StringUtil } from '../utils/string_util';

class SandboxRequest {

    url: string;

    method: string;

    headers: _.Dictionary<string>;

    formDatas: _.Dictionary<string>;

    body: string;
}

class Console {

    msgQueue: Array<ConsoleMsg> = [];

    private write(type: string, msg: string) {
        this.msgQueue.push({ time: new Date(), type, message: msg, custom: true });
    }

    log(msg: string) {
        this.write('log', msg);
    }

    info(msg: string) {
        this.write('info', msg);
    }

    warn(msg: string) {
        this.write('warn', msg);
    }

    error(msg: string) {
        this.write('error', msg);
    }
}

export class Sandbox {

    static defaultExport: any = 'export:impossiblethis:tropxe';

    private _allProjectJsFiles: _.Dictionary<ProjectData> = {};

    console: Console = new Console();

    tests: _.Dictionary<boolean> = {};

    variables: any;

    request: SandboxRequest;

    exportObj = { content: Sandbox.defaultExport };

    constructor(private projectId: string, private vid: string, private envId: string, private envName: string, private envVariables: _.Dictionary<string>, record?: Record) {
        this.initVariables();
        this._allProjectJsFiles = ProjectDataService.instance.getProjectAllJSFiles(projectId);
        if (record) {
            this.request = {
                url: StringUtil.stringifyUrl(record.url, record.queryStrings),
                method: record.method || 'GET',
                body: record.body,
                formDatas: {},
                headers: {}
            };
            record.headers.filter(h => h.isActive).forEach(h => {
                this.request.headers[h.key] = h.value;
            });
            record.formDatas.filter(h => h.isActive).forEach(f => {
                this.request.formDatas[f.key] = f.value;
            });
        }
    }

    private initVariables() {
        this.variables = UserVariableManager.getVariables(this.vid, this.envId);
    }

    // private getProjectFile(file: string, type: ProjectFolderType): string {
    //     return path.join(__dirname, `../global_data/${this.projectId}/${type}/${file}`);
    // }

    require(lib: string) {
        if (Setting.instance.safeVM) {
            throw new Error('not support [require] in SafeVM mode, you can set it to false in config file if you want to use [require].');
        }
        if (!this._allProjectJsFiles[lib]) {
            throw new Error(`no valid js lib named [${lib}], you should upload this lib first.`);
        }
        let libPath = this._allProjectJsFiles[lib].path;
        if (!fs.existsSync(libPath)) {
            throw new Error(`[${libPath}] does not exist.`);
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
        return this.variables[key] || this.envVariables[key];
    }

    removeEnvVariable(key: string) {
        Reflect.deleteProperty(this.variables, key);
    }

    setRequest(r: any) {
        this.request = r;
    }

    get environment() {
        return this.envName;
    }

    export(obj: any) {
        this.exportObj.content = obj;
    };
}