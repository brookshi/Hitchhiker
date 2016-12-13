import baseController from '../common/baseController';
import { ParamType } from "./paramType";
import 'reflect-metadata';

const Router = Symbol();
export { Router }; 

export function GET(path?: string) {
    return (target: baseController, name: string) => setMethodDecorator(target, name, 'GET', path);
} 

export function POST(path?: string) {
    return (target: baseController, name: string) => setMethodDecorator(target, name, 'POST', path);
}

export function DELETE(path?: string) {
    return (target: baseController, name: string) => setMethodDecorator(target, name, 'DELETE', path);
}

export function PUT(path?: string) {
    return (target: baseController, name: string) => setMethodDecorator(target, name, 'PUT', path);
}

export function QueryParam(param: string) {
    return (target: baseController, name: string, index: number) => {
        setParamDecorator(target, name, index, { name: param, type: ParamType.Query });
    };
}

export function PathParam(param: string) {
    return (target: baseController, name: string, index: number) => {
        setParamDecorator(target, name, index, { name: param, type: ParamType.Path });
    }
}

export function BodyParam(target: baseController, name: string, index: number) {
    setParamDecorator(target, name, index, { name: "", type: ParamType.Body });
}

function setMethodDecorator(target: baseController, name: string, method: string, path?: string){
    target[Router] = target[Router] || {};
    target[Router][name] = target[Router][name] || {};
    target[Router][name].method = method;
    target[Router][name].path = path;
}

function setParamDecorator(target: baseController, name: string, index: number, value: {name: string, type: ParamType}) {
    let paramTypes = Reflect.getMetadata("design:paramtypes", target, name);
    target[Router] = target[Router] || {};
    target[Router][name] = target[Router][name] || {};
    target[Router][name].params = target[Router][name].params || [];
    target[Router][name].params[index] = { type: paramTypes[index], name: value.name, paramType: value.type };
}