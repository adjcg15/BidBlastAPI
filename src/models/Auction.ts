import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize"

class Auction extends Model {
    declare id_auction: number;
    declare description: string;
    declare base_price: number;
    declare minimun_bid: number;
    declare approval_date: string;
    declare title: string;
    declare days_available: number;
}

Auction.init(
    {
        id_auction: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        base_price: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        minimum_bid: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        approval_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        days_available: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "auctions",
        timestamps: false
    }
);

export default Auction;