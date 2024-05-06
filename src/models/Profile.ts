import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";
import Account from "./Account";

class Profile extends Model {
    declare id_profile: number;
    declare full_name: string;
    declare phone_number: string;
    declare avatar: Buffer;
}

Profile.init(
    {
        id_profile: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phone_number: {
            type: DataTypes.CHAR(10),
            allowNull: true
        },
        avatar: {
            type: DataTypes.BLOB,
            allowNull: true
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "profiles",
        timestamps: false
    }
);

Profile.hasOne(Account);

export default Profile;