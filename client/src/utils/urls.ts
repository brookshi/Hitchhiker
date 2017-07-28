export class Urls {

    static host = 'http://localhost:3000/';

    static getUrl(action: string): string {
        return `${Urls.host}api/${action}`;
    }

    static getWebSocket(action: string): string {
        return `ws${Urls.host.substr(4)}${action}`;
    }
} 