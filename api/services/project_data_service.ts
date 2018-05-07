import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs-extra';
import { SessionService } from '../services/session_service';
import { UserVariableManager } from '../services/user_variable_manager';
import { Setting } from '../utils/setting';
import { ProjectData } from '../interfaces/dto_project_data';
import { ProjectFolderType } from '../common/string_type';
import * as AdmZip from 'adm-zip';
import { ChildProcessManager } from '../run_engine/process/child_process_manager';
import { ScheduleProcessHandler } from '../run_engine/process/schedule_process_handler';

export class ProjectDataService {

    static libFolderName: ProjectFolderType = 'lib';
    static dataFolderName: ProjectFolderType = 'data';
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

    reload() {
        this.clearAll();
        this.initGlobalFiles();
        this.initProjectFiles();
    }

    notifyLibsChanged() {
        const handler = ChildProcessManager.default.getHandler('schedule') as ScheduleProcessHandler;
        if (handler) {
            handler.reloadLib();
        }
    }

    getProjectAllJSFiles(projectId: string) {
        const allJSFiles = {};
        _.keys(this._gJsFiles).forEach(k => allJSFiles[k] = this._gJsFiles[k]);
        if (this._pJsFiles[projectId]) {
            _.keys(this._pJsFiles[projectId]).forEach(k => allJSFiles[k] = this._pJsFiles[projectId][k]);
        }
        return allJSFiles;
    }

    saveDataFile(pid: string, file: string, content: string, replaceIfExist: boolean = true) {
        if (!this._pDataFiles[pid]) {
            this._pDataFiles[pid] = {};
            this.prepareProjectFolder(pid);
        }
        if (!replaceIfExist && this._pDataFiles[pid][file]) {
            return;
        }
        const projectFile = this.getProjectFile(pid, file, ProjectDataService.dataFolderName);
        fs.writeFileSync(projectFile, content);
        const size = Buffer.byteLength(content || '', 'utf8');
        this._pDataFiles[pid][file] = { name: file, path: projectFile, createdDate: new Date(), size };
    }

    prepareProjectFolder(pid: string) {
        const projectFolder = this.getProjectFolder(pid);
        if (!fs.existsSync(projectFolder)) {
            fs.mkdirSync(projectFolder, 0o666);
            fs.mkdirSync(this.getActualPath(projectFolder, ProjectDataService.libFolderName), 0o666);
            fs.mkdirSync(this.getActualPath(projectFolder, ProjectDataService.dataFolderName), 0o666);
        }
    }

    handleUploadFile(pid: string, file: string, type: ProjectFolderType) {
        if (type === 'lib') {
            this.unZipJS(pid, file);
        } else {
            const projectFile = this.getProjectFile(pid, file, ProjectDataService.dataFolderName);
            if (!this._pDataFiles[pid]) {
                this._pDataFiles[pid] = {};
            }
            this._pDataFiles[pid][file] = { name: file, path: projectFile, createdDate: new Date(), size: 0 };
        }
        this.notifyLibsChanged();
    }

    unZipJS(pid: string, file: string) {
        const projectFile = this.getProjectFile(pid, file, ProjectDataService.libFolderName);
        if (!fs.existsSync(projectFile)) {
            return;
        }
        const projectFolder = this.getProjectFolder(pid);
        const targetFile = this.removeExt(projectFile, 'zip');
        new AdmZip(projectFile).extractAllTo(targetFile, true);
        if (!this._pJsFiles[pid]) {
            this._pJsFiles[pid] = {};
        }
        this._pJsFiles[pid][this.removeExt(file, 'zip')] = { name: this.removeExt(file, 'zip'), path: targetFile, createdDate: new Date(), size: 0 };
        fs.unlink(projectFile);
    }

    removeFile(type: ProjectFolderType, pid: string, file: string) {
        const files = type === ProjectDataService.dataFolderName ? this._pDataFiles : this._pJsFiles;
        if (files[pid] && files[pid][file]) {
            Reflect.deleteProperty(files[pid], file);
            fs.removeSync(this.getProjectFile(pid, file, type));
        }
    }

    clearAll() {
        this.clearData(this._pJsFiles);
        this.clearData(this._gJsFiles);
        this.clearData(this._pDataFiles);
        this.clearData(this._gDataFiles);
    }

    private clearData(data: _.Dictionary<any>) {
        if (!data) {
            return;
        }

        Object.keys(data).forEach(k => {
            delete data[k];
        });
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
                        const fileName = this.removeExt(f, 'js');
                        (isProject ? this._pJsFiles[pid] : this._gJsFiles)[fileName] = this.createFileData(folder, f, fileStat);
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
        return { name, path: path.join(folder, name), createdDate: stat.ctime, size: stat.size };
    }

    private initProjectFiles() {
        const projectFolders = fs.readdirSync(path.join(ProjectDataService.globalFolder, 'project')).filter(f => fs.lstatSync(path.join(ProjectDataService.globalFolder, f)).isDirectory && !this.isDataOrLibFolder(f));
        projectFolders.forEach(folder => {
            this.initFolderFiles(path.join(ProjectDataService.globalFolder, 'project', folder), true, true, folder);
            this.initFolderFiles(path.join(ProjectDataService.globalFolder, 'project', folder), true, false, folder);
        });
    }

    private isDataOrLibFolder(folder: string) {
        return folder === ProjectDataService.libFolderName || folder === ProjectDataService.dataFolderName;
    }

    private initGlobalFiles() {
        this.initFolderFiles(ProjectDataService.globalFolder, false, true);
        this.initFolderFiles(ProjectDataService.globalFolder, false, false);
    }

    private getActualPath(folder: string, type: ProjectFolderType): string {
        return path.join(folder, type);
    }

    private removeExt(file: string, ext: string) {
        return file.endsWith(ext) ? file.substr(0, file.length - ext.length - 1) : file;
    }

    private getProjectFolder(pid: string) {
        return path.join(ProjectDataService.globalFolder, `project/${pid}`);
    }

    getProjectFile(pid: string, file: string, type: ProjectFolderType): string {
        return path.join(ProjectDataService.globalFolder, `project/${pid}/${type}/${file}`);
    }
}