import { DataTypes, Model } from "sequelize";
import DataBase from "@lib/db";
import Auction from "./Auction";
import Profile from "./Profile";

class AuctionReviews extends Model{
    declare id_auction_review: number;
    declare creation_date: Date;
    declare comments: string;
} 

AuctionReviews.init(
    {
        id_auction_review: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        creation_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        comments: {
            type: DataTypes.STRING,
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
        tableName: "auction_reviews",
        timestamps: false
    }
);

export default AuctionReviews;