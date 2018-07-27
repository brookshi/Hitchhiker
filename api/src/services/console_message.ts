import { ConsoleMsg } from '../common/interfaces/dto_res';

export class ConsoleMessage {

    private valid: boolean;

    private msgs: ConsoleMsg[] = [];

    get messages() {
        return this.msgs;
    }

    static create(valid: boolean) {
        var cm = new ConsoleMessage();
        cm.valid = valid;
        return cm;
    }

    push(message: string, type: string = 'info', force?: boolean) {
        if (force || this.valid) {
            this.msgs.push({ time: new Date(), message, type, custom: false });
        }
    }

    pushArray(msgs: ConsoleMsg[], _isCustom?: boolean, force?: boolean) {
        if (force || this.valid) {
            this.msgs.push(...msgs);
        }
    }
}