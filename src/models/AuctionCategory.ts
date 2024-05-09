import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";

class AuctionCategory extends Model{
    declare id_auction_category: number;
    declare title: string;
    declare keywords: string;
    declare description: string;
}

AuctionCategory.init(
    {
        id_auction_category: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING(60),
            allowNull: false,
            unique: true
        },
        keywords: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "auction_categories",
        timestamps: false
    }
);

export default AuctionCategory;