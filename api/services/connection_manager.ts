import { createConnection, Connection, ConnectionOptions } from 'typeorm';

const connectionOptions: ConnectionOptions = {
    driver: {
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "root",
        password: "hitchhiker888",
        database: "hitchhiker"
    },
    logging: {
        logQueries: true,
        logFailedQueryError: true,
    },
    autoSchemaSync: true,
    entities: [__dirname + "/../models/{*.ts,*.js}"],
}

export class ConnectionManager {
    private static instance: Connection = null;

    static async getInstance(): Promise<Connection> {
        if (ConnectionManager.instance === null) {
            ConnectionManager.instance = await createConnection(connectionOptions);
        }
        return ConnectionManager.instance;
    }

    static async init(): Promise<any> {
        await ConnectionManager.getInstance();
    }
}