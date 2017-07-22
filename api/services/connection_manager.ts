import { createConnection, Connection, ConnectionOptions, getConnection } from 'typeorm';
import { Log } from '../utils/log';
import { Setting } from '../utils/setting';

export class ConnectionManager {
    private static instance: Connection = null;
    private static isInitialize = false;

    private static connectionOptions: ConnectionOptions = {
        ...Setting.instance.db,
        password: process.env.dbpwd || Setting.instance.db.password,
        type: 'mysql',
        logging: {
            logger: (level: string, message: any) => Log[!Log[level] ? 'debug' : level](message),
            logQueries: true,
            logSchemaCreation: true,
            logFailedQueryError: true,
        },
        autoSchemaSync: true,
        entities: [__dirname + '/../models/{*.ts,*.js}'],
    };

    static async getInstance(): Promise<Connection> {
        if (!ConnectionManager.isInitialize) {
            ConnectionManager.isInitialize = true;
            ConnectionManager.instance = await createConnection(ConnectionManager.connectionOptions);
        }
        while (ConnectionManager.instance === null) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return getConnection();
    }

    static async init(): Promise<any> {
        await ConnectionManager.getInstance();
    }
}