export class Urls {

    static host = 'localhost';

    static port = '3000';

    static getUrl(action: string): string {
        return `http://${Urls.host}:${Urls.port}/api/${action}`;
    }

    static getWebSocket(action: string): string {
        return `ws://${Urls.host}:${Urls.port}/${action}`;
    }
}