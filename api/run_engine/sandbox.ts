import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';

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

    variables: any = {};

    exportObj = { content: Sandbox.defaultExport };

    constructor(private projectId: string) {
        const globalFolder = path.join(__dirname, `../global_data`);
        const projectFolder = this.getProjectFolder();
        const initFiles = (folder, isProject, isJs) => {
            if (isJs) {
                folder = this.getActualPath(globalFolder, 'lib');
            } else {
                folder = this.getActualPath(globalFolder, 'data');
            }
            if (fs.existsSync(folder)) {
                const files = fs.readdirSync(folder).filter(value => fs.lstatSync(path.join(folder, value)).isFile);
                files.forEach(f => {
                    if (isJs) {
                        if (f.endsWith('.js')) {
                            const fileName = f.substr(0, f.length - 3);
                            (isProject ? this._pJsFiles : this._gJsFiles)[f.substr(0, f.length - 3)] = `${folder}/${fileName}`;
                        }
                    } else {
                        (isProject ? this._pDataFiles : this._gDataFiles)[f] = `${folder}/${f}`;
                    }
                });
            }
        };
        initFiles(globalFolder, false, true);
        initFiles(globalFolder, false, false);
        initFiles(projectFolder, true, true);
        initFiles(projectFolder, true, false);
        _.keys(this._gJsFiles).forEach(k => this._allJsFiles[k] = this._gJsFiles[k]);
        _.keys(this._pJsFiles).forEach(k => this._allJsFiles[k] = this._pJsFiles[k]);
    }

    getProjectFolder(): string {
        return path.join(__dirname, `../global_data/${this.projectId}`);
    }

    getProjectFile(file: string): string {
        return path.join(__dirname, `../global_data/${this.projectId}/${file}`);
    }

    getActualPath(folder: string, type: 'lib' | 'data'): string {
        return path.join(folder, type);
    }

    require(lib: string) {
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
        const projectFile = this.getProjectFile(file);
        fs.writeFileSync(projectFile, content);
    }

    export(obj: any) {
        this.exportObj.content = obj;
    };
}