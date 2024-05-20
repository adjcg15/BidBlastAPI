import DataBase from "@lib/db";
import { DataTypes, Model } from "sequelize"

class ItemCondition extends Model {
    declare id_item_condition: number;
    declare name: string;
}

ItemCondition.init(
    {
        id_item_condition: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(60),
            allowNull: false
        }
    },
    {
        sequelize: DataBase.getInstance().getConnection(),
        tableName: "item_conditions",
        timestamps: false
    }
);

export default ItemCondition;