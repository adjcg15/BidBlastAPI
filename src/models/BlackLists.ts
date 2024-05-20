import { DataTypes, Model } from "sequelize";
import DataBase from "@lib/db";
import Auction from "./Auction";
import Profile from "./Profile";

class BlackLists extends Model{
    declare id_black_list: number;
    declare creation_date: Date;
} 

BlackLists.init(
    {
        id_black_list: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        creation_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        id_profile: {
            type: DataTypes.INTEGER,
            references: {
                model: Profile,
                key: "id_profile"
            }
        },
        id_auction: {
            type: DataTypes.INTEGER,
            references: {
                model: Auction,
                key: "id_auction"
            }
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "black_lists",
        timestamps: false
    }
);

export default BlackLists;