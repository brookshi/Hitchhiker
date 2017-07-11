
export type HttpMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE' | string;

export class HttpMethod {
    static GET = 'GET';
    static POST = 'POST';
    static PUT = 'PUT';
    static DELETE = 'DELETE';
    static PATCH = 'PATCH';
    static HEAD = 'HEAD';
    static OPTIONS = 'OPTIONS';
    static CONNECT = 'CONNECT';
    static TRACE = 'TRACE';
}