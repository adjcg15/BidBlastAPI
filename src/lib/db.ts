import mysql from "mysql2";
import { Pool } from "mysql2/typings/mysql/lib/Pool";

class DataBase {
    private static POOL_CONNECTION: Pool | null;

    public static connection() {
        if(DataBase.POOL_CONNECTION == null) {
            const host = process.env.HOST;
            const port = parseInt(process.env.DB_PORT ?? "");
            const database = process.env.DB_NAME;
            const user = process.env.DB_USER;
            const password = process.env.DB_PASSWORD;

            DataBase.POOL_CONNECTION = mysql.createPool({
                host,
                port,
                database,
                user,
                password
            });
        }
        
        return DataBase.POOL_CONNECTION;
    }
}

export default DataBase;