import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";

class AuctionState extends Model{
    declare id_auction_state: number;
    declare name: string
}

AuctionState.init(
    {
        id_auction_state: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: false,
            unique: true
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "auction_states",
        timestamps: false
    }
);

export default AuctionState;