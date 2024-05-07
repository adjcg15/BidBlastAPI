import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";
import Profile from "./Profile";

class Account extends Model {
    declare id_account: number;
    declare email: string;
    declare password: string;
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
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "accounts",
        timestamps: false
    }
);

Profile.hasOne(Account, {
    foreignKey: {
        name: "id_profile",
        allowNull: false
    },
    onDelete: "CASCADE"
});
Account.belongsTo(Profile, {
    foreignKey: {
        name: "id_profile",
        allowNull: false
    },
    onDelete: "CASCADE"
});

export default Account;