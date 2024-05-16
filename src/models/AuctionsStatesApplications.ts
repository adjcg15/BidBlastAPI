import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize";
import Auction from "./Auction";
import AuctionState from "./AuctionState";

class AuctionStatesApplications extends Model{
    declare id_auction_state_application: number;
    declare application_date: Date
}

AuctionStatesApplications.init(
    {
        id_auction_state_application: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        application_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        id_auction: {
            type: DataTypes.INTEGER,
            references: {
                model: Auction,
                key: "id_auction"
            }
        },
        id_auction_state: {
            type: DataTypes.INTEGER,
            references: {
                model: AuctionState,
                key: "id_auction_state"
            }
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "auctions_states_applications",
        timestamps: false
    }
);

export default AuctionStatesApplications;