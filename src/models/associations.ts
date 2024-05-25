import Account from "./Account";
import AccountsRoles from "./AccountsRoles";
import Profile from "./Profile";
import Role from "./Role";
import Auction from "./Auction";
import AuctionCategory from "./AuctionCategory";
import ItemCondition from "./ItemCondition";
import HypermediaFile from "./HypermediaFile";
import Offer from "./Offer";
import AuctionStatesApplications from "./AuctionsStatesApplications";
import AuctionState from "./AuctionState";
import AuctionReviews from "./AuctionReviews";
import BlackLists from "./BlackLists";
import AuctionReview from "./AuctionReview";

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

    Auction.belongsToMany(Profile, { 
        through: Offer, 
        foreignKey: "id_auction",
        otherKey: "id_profile",
        as: "Customer"
    });
    Profile.belongsToMany(Auction, { 
        through: Offer,
        foreignKey: "id_profile",
        otherKey: "id_auction",
        as: "Customer"
    });
    Auction.hasMany(Offer, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Offer.belongsTo(Auction, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Profile.hasMany(Offer, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Offer.belongsTo(Profile, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Auction.hasMany(AuctionStatesApplications, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    AuctionStatesApplications.belongsTo(Auction, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    AuctionState.hasMany(AuctionStatesApplications, {
        foreignKey: {
            name: "id_auction_state",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    AuctionStatesApplications.belongsTo(AuctionState, {
        foreignKey: {
            name: "id_auction_state",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Auction.hasMany(AuctionReviews, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    AuctionReviews.belongsTo(Auction, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Profile.hasMany(AuctionReviews, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    AuctionReviews.belongsTo(Profile, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Auction.hasMany(BlackLists, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    BlackLists.belongsTo(Auction, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Profile.hasMany(BlackLists, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    BlackLists.belongsTo(Profile, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });

    AuctionReview.belongsTo(Profile, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Profile.hasMany(AuctionReview, {
        foreignKey: {
            name: "id_profile",
            allowNull: false
        },
        onDelete: "CASCADE"
    });

    AuctionReview.belongsTo(Auction, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
    Auction.hasOne(AuctionReview, {
        foreignKey: {
            name: "id_auction",
            allowNull: false
        },
        onDelete: "CASCADE"
    });
}

export default configureModel;