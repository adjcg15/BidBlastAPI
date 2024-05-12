import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";
import Account from "./Account";
import Role from "./Role";

class AccountsRoles extends Model {
    declare id_account_rol: number;
}

AccountsRoles.init(
    {
        id_account_rol: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_account: {
            type: DataTypes.INTEGER,
            references: {
                model: Account,
                key: "id_account"
            }
        },
        id_rol: {
            type: DataTypes.INTEGER,
            references: {
                model: Role,
                key: "id_rol"
            }
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "accounts_roles",
        timestamps: false
    }
);

export default AccountsRoles;