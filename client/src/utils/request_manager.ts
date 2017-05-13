export default class RequestManager {
    private static requestCanceledPool: { [key: string]: boolean } = {};

    static get(url: string): Promise<Response> {
        return fetch(url);
    }

    static post(url: string, body: any): Promise<Response> {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }

    static put(url: string, body: any): Promise<Response> {
        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
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