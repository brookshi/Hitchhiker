import * as crypto from 'crypto';
import { Setting } from "./setting";

export class StringUtil {
    static md5(str: string): string {
        return crypto.createHash('md5').update(str).digest('hex');
    }

    static encrypt(str: string): string {
        return crypto.createCipher('aes-256-cbc', Setting.instance.app.encrptykey).update(str, 'utf8', 'base64');
    }

    static decrypt(str: string): string {
        return crypto.createDecipher('aes-256-cbc', Setting.instance.app.encrptykey).update(str, 'base64', 'utf8');
    }

    static applyTemplate(target: string, variables: { [key: string]: string }): string {
        let arr = new Array<string>();
        let regex = /{{.*?}}/g;
        let rst;
        while ((rst = regex.exec(target)) !== null) {
            arr.push(<string>rst);
        }

        if (arr.length === 0) {
            return target;
        }

        arr.forEach(o => {
            let key = o.replace('{{', '').replace('}}', '');
            let variable = variables[key];
            if (variable !== undefined) {
                target = target.replace(o, variable);
            }
        });
        return target;
    }
}