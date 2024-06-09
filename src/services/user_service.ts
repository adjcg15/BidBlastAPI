import { DataContextException } from "@exceptions/services";
import ImageConverter from "@lib/image_converter";
import Account from "@models/Account";
import AccountsRoles from "@models/AccountsRoles";
import { Transaction } from "sequelize";
import Profile from "@models/Profile";
import Role from "@models/Role";
import { IUserData } from "@ts/data";
import SecurityService from "@lib/security_service";
import DataBase from "@lib/db";
import { UpdateUserCodes } from "@ts/enums";

class UserService {
    public static async createUser(fullName: string, email: string, phoneNumber: string | null, avatar: Buffer | null, password: string): Promise<Account> {
        let transaction: Transaction | null = null;

        try {
            if (!Account.sequelize) {
                throw new DataContextException("Sequelize instance is not available");
            }
            const securityService = new SecurityService();
            const hashedPassword = securityService.hashPassword(password);

            transaction = await Account.sequelize.transaction();

            const profile = await Profile.create(
                { full_name: fullName, phone_number: phoneNumber, avatar, id_account: null },
                { transaction }
            );

            const account = await Account.create(
                { email, password: hashedPassword, id_profile: profile.id_profile },
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

    public static async updateUser(idProfile: number, fullName: string, email: string, phoneNumber: string, avatar: Buffer, password: string): Promise<UpdateUserCodes | null> {
        let resultCode: UpdateUserCodes | null = null;
        
        const sequelize = DataBase.getInstance().getConnection();
        const transaction = await sequelize.transaction();
        
        try {
            if (!Account.sequelize) {
                throw new DataContextException("Sequelize instance is not available");
            }

            const dbProfile = await Profile.findByPk(idProfile);

            if (dbProfile === null) {
                resultCode = UpdateUserCodes.PROFILE_NOT_FOUND;
                return resultCode;
            }

            const dbAccount = await Account.findOne({
                attributes: {
                    include: [
                        [sequelize.literal(`(
                            SELECT IF(COUNT(*) > 0, 1, 0)
                            FROM accounts
                            WHERE email = "${email}" AND id_profile != "${idProfile}"
                        )`),
                        "emailAlreadyExists"]
                    ]
                },
                where: {
                    id_profile: idProfile
                }
            });

            if (dbAccount === null) {
                resultCode = UpdateUserCodes.ACCOUNT_NOT_FOUND;
                return resultCode;
            }

            const { emailAlreadyExists } = dbAccount.toJSON();
            if (emailAlreadyExists) {
                resultCode = UpdateUserCodes.EMAIL_ALREADY_EXISTS;
                return resultCode;
            }

            const securityService = new SecurityService();
            const hashedPassword = securityService.hashPassword(password);

            await dbProfile.update(
                {
                    full_name: fullName, phone_number: phoneNumber, avatar
                },
                {
                    transaction
                }
            );

            await dbAccount.update(
                {
                    email, password: hashedPassword
                },
                {
                    transaction
                }
            );
            await transaction.commit();
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to update the information of the user. ${errorCodeMessage}`
            );
        }

        return resultCode;
    }

    public static async getUserByEmail(email: string) {
        let user: IUserData | null = null;

        try {
            const account = await Account.findOne({
                where: {
                    email
                },
                include: [Role, Profile]
            });

            if(account != null) {
                const accountInformation = account.toJSON();
                const roles = accountInformation.Roles as any[];

                user = {
                    id: accountInformation.Profile.id_profile,
                    fullName: accountInformation.Profile.full_name,
                    phoneNumber: accountInformation.Profile.phone_number ?? "",
                    avatar: ImageConverter.bufferToBase64(accountInformation.Profile.avatar),
                    email: accountInformation.email,
                    roles: roles.map(role => role.name),
                    password: accountInformation.password
                };
            }
        } catch(error:any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";

            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to access to the information of the user. ${errorCodeMessage}`
            );
        }

        return user;
    }
}

export default UserService;