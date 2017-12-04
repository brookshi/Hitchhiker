import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { Log } from './log';
import * as _ from 'lodash';

export class ScriptTransform {

    static toES5(source: string): string {
        const result = ts.transpileModule(source, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES5
            }
        });

        return result.outputText;
    }

    static async zipAll(): Promise<Buffer> {
        const zipPath = path.join(__dirname, '../global_data');
        const zipFile = `${zipPath}.zip`;
        if (fs.existsSync(zipFile)) {
            fs.unlinkSync(zipFile);
        }

        const output = fs.createWriteStream(zipFile);
        const archive = archiver('zip');
        let isClose = false;

        archive.on('error', (err: Error) => {
            Log.error(`zip global data error: ${err.message}`);
        });

        output.on('close', () => { isClose = true; });
        output.on('end', () => { isClose = true; });

        archive.pipe(output);
        archive.directory(zipPath, false);
        // const folders = fs.readdirSync(zipPath);
        // folders.forEach(f => {
        //     if (fs.statSync(path.join(zipPath, f)).isDirectory) {
        //         archive.directory(path.join(zipPath, f), f);
        //     }
        // });
        await archive.finalize();

        while (!isClose) {
            await new Promise((resolve, reject) => {
                setTimeout(resolve, 100);
            });
        }

        return fs.readFileSync(zipFile);
    }
}