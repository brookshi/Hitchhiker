import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { SessionService } from '../services/session_service';
import { UserVariableManager } from '../services/user_variable_manager';
import { Setting } from '../utils/setting';
import { ProjectData } from '../interfaces/dto_project_data';

export type FolderType = 'lib' | 'data';

export class ProjectDataService {

    static libFolderName: FolderType = 'lib';
    static dataFolderName: FolderType = 'data';
    static globalFolder: string = path.join(__dirname, `../global_data`);

    static instance: ProjectDataService = new ProjectDataService();

    readonly _pJsFiles: _.Dictionary<_.Dictionary<ProjectData>> = {};

    readonly _pDataFiles: _.Dictionary<_.Dictionary<ProjectData>> = {};

    readonly _gJsFiles: _.Dictionary<ProjectData> = {};

    readonly _gDataFiles: _.Dictionary<ProjectData> = {};

    private constructor() {
        this.initGlobalFiles();
        this.initProjectFiles();
    }

    init() {
        // TODO: watch folder change
        // fs.watch(ProjectDataService.globalFolder, { recursive: true }, (event, fileName) => {

        // });
    }

    getProjectAllJSFiles(projectId: string) {
        const allJSFiles = {};
        _.keys(this._gJsFiles).forEach(k => allJSFiles[k] = this._gJsFiles[k]);
        if (this._pJsFiles[projectId]) {
            _.keys(this._pJsFiles[projectId]).forEach(k => allJSFiles[k] = this._pJsFiles[projectId][k]);
        }
        return allJSFiles;
    }

    saveFile(pid: string, file: string, content: string, replaceIfExist: boolean = true) {
        if (!this._pDataFiles[pid]) {
            this._pDataFiles[pid] = {};
            var projectFolder = path.join(ProjectDataService.globalFolder, `${pid}`);
            if (!fs.existsSync(projectFolder)) {
                fs.mkdirSync(projectFolder, 0o666);
                fs.mkdirSync(this.getActualPath(projectFolder, ProjectDataService.libFolderName), 0o666);
                fs.mkdirSync(this.getActualPath(projectFolder, ProjectDataService.dataFolderName), 0o666);
            }
        }
        if (!replaceIfExist && this._pDataFiles[pid][file]) {
            return;
        }
        const projectFile = this.getProjectFile(pid, file, 'data');
        fs.writeFileSync(projectFile, content);
        const size = Buffer.byteLength(content || '', 'utf8');
        this._pDataFiles[pid][file] = { name: file, path: projectFile, createdDate: new Date(), size };
    }

    removeFile(pid: string, file: string) {
        if (this._pDataFiles[pid] && this._pDataFiles[pid][file]) {
            Reflect.deleteProperty(this._pDataFiles[pid], file);
            fs.rmdirSync(this.getProjectFile(pid, file, ProjectDataService.dataFolderName));
        }
    }

    private initFolderFiles(folder: string, isProject: boolean, isJs: boolean, pid?: string) {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, 0o666);
        }
        folder = this.getActualPath(folder, isJs ? ProjectDataService.libFolderName : ProjectDataService.dataFolderName);
        if (pid) {
            this._pJsFiles[pid] = this._pJsFiles[pid] || {};
            this._pDataFiles[pid] = this._pDataFiles[pid] || {};
        }
        if (fs.existsSync(folder)) {
            const files = fs.readdirSync(folder);
            files.forEach(f => {
                const fileStat = fs.lstatSync(path.join(folder, f));
                if (isJs) {
                    if (fileStat.isDirectory) {
                        (isProject ? this._pJsFiles[pid] : this._gJsFiles)[f] = this.createFileData(folder, f, fileStat);
                    } else if (fileStat.isFile && f.endsWith('.js')) {
                        const fileName = f.substr(0, f.length - 3);
                        (isProject ? this._pJsFiles[pid] : this._gJsFiles)[f.substr(0, f.length - 3)] = this.createFileData(folder, fileName, fileStat);
                    }
                } else if (fileStat.isFile) {
                    (isProject ? this._pDataFiles[pid] : this._gDataFiles)[f] = this.createFileData(folder, f, fileStat);
                }
            });
        } else {
            fs.mkdirSync(folder, 0o666);
        }
    }

    private createFileData(folder: string, name: string, stat: fs.Stats) {
        return { name, path: `${folder}/${name}`, createdDate: stat.ctime, size: stat.size };
    }

    private initProjectFiles() {
        const projectFolders = fs.readdirSync(ProjectDataService.globalFolder).filter(f => fs.lstatSync(path.join(ProjectDataService.globalFolder, f)).isDirectory);
        projectFolders.forEach(folder => {
            this.initFolderFiles(path.join(ProjectDataService.globalFolder, folder), true, true, folder);
            this.initFolderFiles(path.join(ProjectDataService.globalFolder, folder), true, false, folder);
        });
    }

    private initGlobalFiles() {
        this.initFolderFiles(ProjectDataService.globalFolder, false, true);
        this.initFolderFiles(ProjectDataService.globalFolder, false, false);
    }

    private getActualPath(folder: string, type: FolderType): string {
        return path.join(folder, type);
    }

    private getProjectFile(pid: string, file: string, type: FolderType): string {
        return path.join(__dirname, `../global_data/${pid}/${type}/${file}`);
    }
}