import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import { Log } from '../utils/log';

export class ConnectionManager {
    private static instance: Connection = null;
    private static isInitialize = false;

    private static connectionOptions: ConnectionOptions = {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'hitchhiker888',
        database: 'hitchhiker',
        logging: {
            logger: (level: string, message: any) => Log[level === 'log' ? 'debug' : level](message),
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
        return ConnectionManager.instance;
    }

    static async init(): Promise<any> {
        await ConnectionManager.getInstance();
    }
}