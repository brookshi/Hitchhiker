
export default class HttpClient {
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
};