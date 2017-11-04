import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { SessionService } from '../services/session_service';
import { UserVariableManager } from '../services/user_variable_manager';
import { Setting } from '../utils/setting';

export class Sandbox {

    static defaultExport: any = 'export:impossiblethis:tropxe';

    static libFolder: string = 'lib';
    static dataFolder: string = 'data';

    _pJsFiles: _.Dictionary<string> = {};

    _pDataFiles: _.Dictionary<string> = {};

    _gJsFiles: _.Dictionary<string> = {};

    _gDataFiles: _.Dictionary<string> = {};

    _allJsFiles: _.Dictionary<string> = {};

    tests: _.Dictionary<boolean> = {};

    variables: any;

    exportObj = { content: Sandbox.defaultExport };

    constructor(private projectId: string, private vid: string, private envId: string) {
        this.initVariables();
        const globalFolder = path.join(__dirname, `../global_data`);
        const projectFolder = this.getProjectFolder();
        if (!fs.existsSync(projectFolder)) {
            fs.mkdirSync(projectFolder, 0o666);
        }
        const initFiles = (folder, isProject, isJs) => {
            if (isJs) {
                folder = this.getActualPath(folder, 'lib');
            } else {
                folder = this.getActualPath(folder, 'data');
            }
            if (fs.existsSync(folder)) {
                const files = fs.readdirSync(folder);
                files.forEach(f => {
                    const fileStat = fs.lstatSync(path.join(folder, f));
                    if (isJs) {
                        if (fileStat.isDirectory) {
                            (isProject ? this._pJsFiles : this._gJsFiles)[f] = `${folder}/${f}`;
                        } else if (fileStat.isFile && f.endsWith('.js')) {
                            const fileName = f.substr(0, f.length - 3);
                            (isProject ? this._pJsFiles : this._gJsFiles)[f.substr(0, f.length - 3)] = `${folder}/${fileName}`;
                        }
                    } else if (fileStat.isFile) {
                        (isProject ? this._pDataFiles : this._gDataFiles)[f] = `${folder}/${f}`;
                    }
                });
            } else {
                fs.mkdirSync(folder, 0o666);
            }
        };
        initFiles(globalFolder, false, true);
        initFiles(globalFolder, false, false);
        initFiles(projectFolder, true, true);
        initFiles(projectFolder, true, false);
        _.keys(this._gJsFiles).forEach(k => this._allJsFiles[k] = this._gJsFiles[k]);
        _.keys(this._pJsFiles).forEach(k => this._allJsFiles[k] = this._pJsFiles[k]);
    }

    initVariables() {
        this.variables = UserVariableManager.getVariables(this.vid, this.envId);
    }

    getProjectFolder(): string {
        return path.join(__dirname, `../global_data/${this.projectId}`);
    }

    getProjectFile(file: string, type: 'lib' | 'data'): string {
        return path.join(__dirname, `../global_data/${this.projectId}/${type}/${file}`);
    }

    getActualPath(folder: string, type: 'lib' | 'data'): string {
        return path.join(folder, type);
    }

    require(lib: string) {
        if (Setting.instance.safeVM) {
            throw new Error('not support [require] in SafeVM mode, you can set it to false if you want to use [require]');
        }
        return require(this._allJsFiles[lib]);
    }

    readFile(file: string): string {
        return this.readFileByReader(file, f => fs.readFileSync(f, 'utf8'));
    }

    readFileByReader(file: string, reader: (file: string) => any): any {
        if (this._pDataFiles[file]) {
            return reader(this._pDataFiles[file]);
        }
        if (this._gDataFiles[file]) {
            return reader(this._pDataFiles[file]);
        }
        throw new Error(`${file} not exists.`);
    }

    saveFile(file: string, content: string, replaceIfExist: boolean = true) {
        if (!replaceIfExist && this._pDataFiles[file]) {
            return;
        }
        const projectFile = this.getProjectFile(file, 'data');
        fs.writeFileSync(projectFile, content);
        this._pDataFiles[file] = projectFile;
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

    export(obj: any) {
        this.exportObj.content = obj;
    };
}