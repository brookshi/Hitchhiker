import * as ts from 'typescript';
import * as AdmZip from 'adm-zip';
import * as path from 'path';

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

    static zipAll(): Buffer {
        const zip = new AdmZip();
        zip.addLocalFolder(path.join(__dirname, '../global_data'));
        return zip.toBuffer();
    }
}