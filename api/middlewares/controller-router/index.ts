import * as Path from 'path';
import * as FS from 'fs';
import * as KoaRouter from 'koa-router';
import * as Koa from 'koa';
import * as FileUtil from '../../utils/fileutil';
import { Router } from '../../utils/symbols';
import { ParamType } from '../../utils/paramType';
import baseController from '../../common/baseController';
import 'reflect-metadata';

export class ControllerRouter {
    
    controllerPath: string;
    koaRouter: KoaRouter;
    defaultMethod: string;

    constructor() {
    }

    router(): (ctx: Koa.Context, next: Function) => Promise<void> {
        this.controllerPath = "controllers";
        this.koaRouter = new KoaRouter();
        this.initRouterForControllers();

        return this.koaRouter.routes();
    }

    initRouterForControllers() {
        let files = FileUtil.getFiles(this.controllerPath);
        files.forEach(file => {
            let exportClass = require(file).default;
            if(this.isAvalidController(exportClass)){
                this.setRouterForClass(exportClass, file);
            }
        });
    }

    private isAvalidController(exportClass: any){
        return Reflect.getPrototypeOf(exportClass) == baseController;
    }

    private setRouterForClass(exportClass: any, file: string) { 
        let controllerRouterPath = this.buildControllerRouter(file);
        let controller = new exportClass();
        for(let funcName in exportClass.prototype[Router]){
            let method = exportClass.prototype[Router][funcName].method.toLowerCase();
            let path = exportClass.prototype[Router][funcName].path;
            this.setRouterForFunction(method, controller, controller[funcName], path ? path : `${controllerRouterPath}/${funcName}`);
        }
    }

    private buildControllerRouter(file: string){
        let relativeFile = Path.relative(Path.join(FileUtil.getApiDir(), this.controllerPath), file);
        let controllerPath = '/' + relativeFile.replace(/\\/g, '/').replace('.js','').toLowerCase();
        if(controllerPath.endsWith('controller'))
            controllerPath = controllerPath.substring(0, controllerPath.length - 10);
        return controllerPath;
    }

    private setRouterForFunction(method: string, controller: any, func: Function, routerPath: string){
        this.koaRouter[method](routerPath, ctx => { func(...this.buildFuncParams(ctx, controller, func)) });
    }

    private buildFuncParams(ctx: any, controller: any, func: Function) {
        let paramsInfo = controller[Router][func.name].params;
        let params = [];
        for(let i = 0; i < paramsInfo.length; i++) {
            if(paramsInfo[i]){
                params.push(paramsInfo[i].type(this.getParam(ctx, paramsInfo[i].paramType, paramsInfo[i].name)));
            } else {
                params.push(ctx);
            }
        }
        return params;
    }

    private getParam(ctx: any, paramType: ParamType, name: string){
        switch(paramType){
            case ParamType.Query:
                return ctx.query[name];
            case ParamType.Path:
                return ctx.params[name];
            case ParamType.Body:
                return ctx.request.body;
            default:
                console.error('does not support this param type');
        }
    }
}