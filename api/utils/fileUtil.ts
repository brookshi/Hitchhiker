import * as Path from 'path';
import * as FS from 'fs';

export function getFiles(dir: string, onlyCurrent = false) {
    let apiDir = getApiDir();
    if(!Path.isAbsolute(dir)) {
        dir = Path.join(apiDir, dir);
    }

    if(!FS.existsSync(dir)) {
        console.error(`dir ${dir} is not a valid path`);
        return;
    }

    let files = FS.readdirSync(dir);
    if(onlyCurrent) {
        return files.filter(value=>value.endsWith('.js') && FS.lstatSync(value).isFile);
    }

    let results = new Array<string>();
    files.forEach(file=>{
        let filePath = Path.join(dir, file);
        let stat = FS.lstatSync(filePath);
        if(stat.isDirectory()){
            results = [...results, ...getFiles(filePath)];
        }
        else if(stat.isFile() && file.endsWith('.js')){
            results.push(filePath);
        }
    });

    return results;
};

export function getApiDir(){
    return Path.resolve(__dirname, "../");
}
