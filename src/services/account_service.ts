import Account from "@models/Account";
import Profile from "@models/Profile";
import AccountsRoles from "@models/AccountsRoles";
import { DataContextException } from "@exceptions/services";
import { Transaction } from "sequelize";

class AccountService {
    public static async createAccount(fullName: string, email: string, phoneNumber: string | null, avatar: Buffer | null, password: string): Promise<Account> {
        let transaction: Transaction | null = null;

        try {
            if (!Account.sequelize) {
                throw new DataContextException("Sequelize instance is not available");
            }

            transaction = await Account.sequelize.transaction();

            const profile = await Profile.create(
                { full_name: fullName, phone_number: phoneNumber, avatar, id_account: null },
                { transaction }
            );

            const account = await Account.create(
                { email, password, id_profile: profile.id_profile },
                { transaction }
            );

            await profile.update({ id_account: account.id_account }, { transaction });

            await AccountsRoles.create(
                { id_account: account.id_account, id_rol: 1 },
                { transaction }
            );

            await transaction.commit();

            return account;
        } catch (error: any) {
            if (transaction) await transaction.rollback();

            console.error("Error creating account:", error);

            if (error.name === 'SequelizeUniqueConstraintError' || error.code === 'ER_DUP_ENTRY') {
                throw new Error("Email already exists");
            }

            throw new DataContextException("Error while creating account: " + error.message);
        }
    }
}

export default AccountService;

