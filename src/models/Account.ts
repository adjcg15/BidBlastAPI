import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";
import Profile from "./Profile";

class Account extends Model {
    declare id_account: number;
    declare email: string;
    declare password: string;
    declare id_profile: number;
}

Account.init(
    {
        id_account: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(60),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.CHAR(64),
            allowNull: false
        },
        id_profile: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Profile,
                key: 'id_profile'
            }
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "accounts",
        timestamps: false
    }
);

export default Account;