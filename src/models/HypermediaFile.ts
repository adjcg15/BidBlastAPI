import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";

class HypermediaFile extends Model {
    declare id_hypermedia_file: number;
    declare mime_type: string;
    declare name: string;
    declare content: Buffer;
}

HypermediaFile.init(
    {
        id_hypermedia_file: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        mime_type: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(60),
            allowNull: true
        },
        content: {
            type: DataTypes.BLOB,
            allowNull: true
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "hypermedia_files",
        timestamps: false
    }
);

export default HypermediaFile;