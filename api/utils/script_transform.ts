import * as ts from 'typescript';

export class ScriptTransform {

    static do(source: string): string {
        const result = ts.transpileModule(source, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES5
            }
        });

        return result.outputText;
    }
}