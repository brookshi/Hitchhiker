import { HttpMethod, HttpMethodType } from '../common/http_method';

export enum SyncType {

    updateRecord = 0,

    addRecord = 1,

    delRecord = 2,

    addCollection = 3,

    updateCollection = 4,

    delCollection = 5,

    updateTeam = 6,

    disbandTeam = 7,

    quitTeam = 8
}

export interface SyncItem {

    type: SyncType;

    method: HttpMethodType;

    url: string;

    body?: any;
}

const jsonHeaders = { 'Content-Type': 'application/json' };

export default class RequestManager {
    private static requestCanceledPool: { [key: string]: boolean } = {};

    static sync(syncItem: SyncItem): Promise<Response> {
        const { url, method, body } = syncItem;
        return RequestManager.request(url, method, body);
    }

    static get(url: string): Promise<Response> {
        return RequestManager.request(url, HttpMethod.GET);
    }

    static post(url: string, body: any): Promise<Response> {
        return RequestManager.request(url, HttpMethod.POST, body);
    }

    static put(url: string, body: any): Promise<Response> {
        return RequestManager.request(url, HttpMethod.PUT, body);
    }

    static delete(url: string): Promise<Response> {
        return RequestManager.request(url, HttpMethod.DELETE);
    }

    static request(url: string, method: HttpMethodType, body?: any): Promise<Response> {
        return fetch(url, { method: method, headers: jsonHeaders, body: body ? JSON.stringify(body) : undefined });
    }

    static cancelRequest(id: string) {
        RequestManager.requestCanceledPool[id] = true;
    }

    static checkCanceledThenRemove(id: string): boolean {
        const isCanceled = RequestManager.isRequestCanceled(id);
        if (isCanceled) {
            RequestManager.removeCanceledRequest(id);
        }
        return isCanceled;
    }

    static isRequestCanceled(id: string): boolean {
        return RequestManager.requestCanceledPool[id];
    }

    static removeCanceledRequest(id: string) {
        Reflect.deleteProperty(RequestManager.requestCanceledPool, id);
    }
}