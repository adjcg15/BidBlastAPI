import Account from "./Account";
import AccountsRoles from "./AccountsRoles";
import Profile from "./Profile";
import Role from "./Role";

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
}

export default configureModel;