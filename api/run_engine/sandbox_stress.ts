
type ProjectFolderType = 'lib' | 'data';

class SandboxRequest {

    url: string;

    method: string;

    headers: _.Dictionary<string>;

    body: string;
}

class Sandbox {

    static defaultExport: any = 'export:impossiblethis:tropxe';

    private _allProjectJsFiles: _.Dictionary<string> = {};

    private _projectDataFiles: _.Dictionary<string> = {};

    tests: _.Dictionary<boolean> = {};

    variables: any;

    request: SandboxRequest;

    exportObj = { content: Sandbox.defaultExport };

    constructor(private projectId: string, private vid: string, private envId: string, private envName: string, variables: any, allProjectJsFiles: any, dataFiles: any, record?: any) {
        this.variables = variables;
        this._allProjectJsFiles = allProjectJsFiles;
        this._projectDataFiles = dataFiles;
        if (record) {
            this.request = {
                url: record.url,
                method: record.method || 'GET',
                body: record.body,
                headers: {}
            };
            record.headers.filter(h => h.isActive).forEach(h => {
                this.request.headers[h.key] = h.value;
            });
        }
    }

    private getProjectFile(file: string, type: ProjectFolderType): string {
        return `./global_data/${this.projectId}/${type}/${file}`;
    }

    require(lib: string) {
        if (!this._allProjectJsFiles[lib]) {
            throw new Error(`no valid js lib named [${lib}], you should upload this lib first.`);
        }
        let libPath = this._allProjectJsFiles[lib];
        if (!libPath) {
            throw new Error(`[${libPath}] does not exist.`);
        }

        return require(libPath);
    }

    readFile(file: string): any {
        return "";//this.readFileByReader(file, f => fs.readFileSync(f, 'utf8'));
    }

    readFileByReader(file: string, reader: (file: string) => any): any {
        if (this._projectDataFiles[file]) {
            return reader(this._projectDataFiles[file]);
        }
        throw new Error(`${file} not exists.`);
    }

    saveFile(file: string, content: string, replaceIfExist: boolean = true) {
        //ProjectDataService.instance.saveDataFile(this.projectId, file, content, replaceIfExist);
    }

    removeFile(file: string) {
        //ProjectDataService.instance.removeFile(ProjectDataService.dataFolderName, this.projectId, file);
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