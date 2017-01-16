import { ConnectionOptions } from "typeorm";

export const connectionOptions: ConnectionOptions = {
    driver: {
        type: "sqlite",
        // host: "localhost",
        // port: 3306,
        // username: "root",
        // password: "admin",
        //database: "data",
        storage: "db/data.db"
    },
    logging: {
        logQueries: true,
        logFailedQueryError: true,
    },
    autoSchemaSync: true,
    entities: [__dirname + "/../models/{*.ts,*.js}"],
}