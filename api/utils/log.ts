import * as Log4js from 'log4js';
import { Logger, getLogger } from 'log4js';

export class Log {

    private static logger: Logger;

    static init() {
        Log4js.configure('logconfig.json');
        Log.logger = getLogger('default');
        Log.logger.setLevel(Log4js.levels.DEBUG);
    }

    static info(info: string) {
        Log.logger.info(info);
    }

    static debug(debug: string) {
        Log.logger.debug(debug);
    }

    static warn(warn: string) {
        Log.logger.warn(warn);
    }

    static error(error: string) {
        Log.logger.error(error);
    }
}