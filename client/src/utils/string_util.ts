import * as uuid from 'uuid';

export class StringUtil {
    static generateUID(): string {
        return uuid.v1();
    }
}