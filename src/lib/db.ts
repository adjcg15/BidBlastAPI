import { DataContextException } from "@exceptions/services";
import { Sequelize } from "sequelize";

class DataBase {
    private static instance: DataBase;
    private connection: Sequelize;

    private constructor() {
        const host = process.env.DB_HOST;
        const port = parseInt(process.env.DB_PORT ?? "");
        const database = process.env.DB_NAME ?? "";
        const user = process.env.DB_USER ?? "";
        const password = process.env.DB_PASSWORD;

        this.connection = new Sequelize(database, user, password, {
            host,
            dialect: "mysql",
            dialectOptions: {
                port
            },
            logging: false
        });
    }

    public static getInstance(): DataBase {
        if(!DataBase.instance) {
            DataBase.instance = new DataBase();
        }

        return DataBase.instance;
    }

    public getConnection() {
        return this.connection;
    }

    public async startConnection() {
        try {
            await this.connection.authenticate();
        } catch (error) {
            throw new DataContextException("It was not possible to stablish the connection");
        }
    }

    public async finishConnection() {
        try {
            await this.connection.close();
        } catch (error) {
            throw new DataContextException("It was not possible to close the connection");
        }
    }
}

export default DataBase;