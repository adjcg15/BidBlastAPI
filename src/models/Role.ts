import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";
import { UserRoles } from "@ts/enums";

class Role extends Model {
    declare id_rol: number;
    declare name: UserRoles;
}

Role.init(
    {
        id_rol: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "roles",
        timestamps: false
    }
);

export default Role;