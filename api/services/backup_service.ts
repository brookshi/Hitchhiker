import * as mysqlDump from 'mysqldump';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';

export class BackupService {

    static isBackuping = false;

    static backupHour = 23;

    static backupMaxCount = 10;

    static backupFolder = path.join(__dirname, '../backup');

    static async backupDB() {
        if (this.isBackuping) {
            Log.info('is backuping');
            return;
        }

        Log.info('try to backup db');
        if (new Date().getHours() !== this.backupHour) {
            Log.info('not the backup time');
            return;
        }
        const files = fs.readdirSync(this.backupFolder);
        const isBackuped = files.some(f => fs.statSync(path.join(this.backupFolder, f)).birthtime.toLocaleDateString() === new Date().toLocaleDateString());
        if (isBackuped) {
            Log.info('db was backuped today');
            return;
        }

        this.isBackuping = true;
        try {
            if (!fs.existsSync(this.backupFolder)) {
                fs.mkdirSync(this.backupFolder, 0o666);
            }

            if (files.length >= this.backupMaxCount) {
                let oldFile = path.join(this.backupFolder, files[0]);
                let oldFileDate = fs.statSync(oldFile).birthtime;
                for (let i = 1; i < files.length; i++) {
                    const newFile = path.join(this.backupFolder, files[i]);
                    const newFileDate = fs.statSync(newFile).birthtime;
                    if (newFileDate > fs.statSync(oldFile).birthtime) {
                        oldFile = newFile;
                        oldFileDate = newFileDate;
                    }
                }
                fs.unlinkSync(oldFile);
            }
            Log.info('dump mysql');
            await this.dump(new Date().toLocaleDateString());
            Log.info('backup completely');
        } catch (ex) {
            Log.error(ex);
        } finally {
            this.isBackuping = false;
        }
    }

    private static dump(name: string): Promise<any> {
        return new Promise((resolve, reject) => {
            mysqlDump({
                host: process.env.HITCHHIKER_DB_HOST || Setting.instance.db.host,
                port: parseInt(process.env.HITCHHIKER_DB_PORT) || Setting.instance.db.port,
                user: process.env.HITCHHIKER_DB_USERNAME || Setting.instance.db.username,
                password: process.env.MYSQL_ROOT_PASSWORD || Setting.instance.db.password,
                database: process.env.MYSQL_DATABASE || Setting.instance.db.database,
                dest: path.join(this.backupFolder, name)
            }, function (err: any) {
                if (err) {
                    Log.error('dump mysql failed');
                    Log.error(err.toString());
                    reject(err);
                } else {
                    Log.info('dump mysql success');
                    resolve();
                }
            });
        });
    }
}