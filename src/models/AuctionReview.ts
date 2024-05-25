import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";

class AuctionReview extends Model {
    declare id_auction_review: number;
    declare creation_date: string;
    declare comments: string;
}

AuctionReview.init(
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
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "auction_reviews",
        timestamps: false
    }
);

export default AuctionReview;