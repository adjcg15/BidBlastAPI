import Account from "./Account";
import AccountsRoles from "./AccountsRoles";
import Profile from "./Profile";
import Role from "./Role";
import Auction from "./Auction";
import AuctionCategory from "./AuctionCategory";
import ItemCondition from "./ItemCondition";
import HypermediaFile from "./HypermediaFile";

function configureModel() {
    Profile.hasOne(Account, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Account.belongsTo(Profile, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });

    Role.belongsToMany(Account, { 
        through: AccountsRoles, 
        foreignKey: "id_rol",
        otherKey: "id_account",
    });
    Account.belongsToMany(Role, { 
        through: AccountsRoles,
        foreignKey: "id_account",
        otherKey: "id_rol",
    });

    Profile.hasMany(Auction, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Auction.belongsTo(Profile, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });

    AuctionCategory.hasMany(Auction, {
        foreignKey: {
            name: "id_auction_category",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Auction.belongsTo(AuctionCategory, {
        foreignKey: {
            name: "id_auction_category",
            allowNull: false
        },
        onDelete: "CASCADE"
    });

    ItemCondition.hasMany(Auction, {
        foreignKey: {
            name: "id_item_condition",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Auction.belongsTo(ItemCondition, {
        foreignKey: {
            name: "id_item_condition",
            allowNull: false
        },
        onDelete: "CASCADE"
    });

    HypermediaFile.belongsTo(Auction, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Auction.hasMany(HypermediaFile, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
}

export default configureModel;