import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";
import Account from "@models/Account";

class Profile extends Model {
    declare id_profile: number;
    declare full_name: string;
    declare phone_number: string | null;
    declare avatar: Buffer | null;
    declare id_account: number;
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
        },
        id_account: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Account,
                key: 'id_account'
            }
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "profiles",
        timestamps: false
    }
);
Account.hasOne(Profile, { foreignKey: 'id_account' });
Profile.belongsTo(Account, { foreignKey: 'id_account' });

export default Profile;
