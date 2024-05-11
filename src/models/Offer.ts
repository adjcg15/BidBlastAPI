import { DataTypes, Model } from "sequelize";
import DataBase from "@lib/db";
import Profile from "./Profile";
import Auction from "./Auction";

class Offer extends Model {
    declare id_offer: number;
    declare amount: number;
    declare creation_date: Date;
}

Offer.init(
    {
        id_offer: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        amount: {
            type: DataTypes.DECIMAL(10, 0),
            allowNull: false
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
        tableName: "offers",
        timestamps: false
    }
);

export default Offer;