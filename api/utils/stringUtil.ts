import * as crypto from 'crypto';

export class StringUtil {
    static md5(str: string): string {
        return crypto.createHash('md5').update(str).digest('hex');
    }
}