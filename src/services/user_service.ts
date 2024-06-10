import { DataContextException } from "@exceptions/services";
import ImageConverter from "@lib/image_converter";
import Account from "@models/Account";
import AccountsRoles from "@models/AccountsRoles";
import { Op, Transaction, literal, where } from "sequelize";
import Profile from "@models/Profile";
import Role from "@models/Role";
import { IUserData } from "@ts/data";
import SecurityService from "@lib/security_service";
import DataBase from "@lib/db";
import { CreateUserCodes, DeleteUserCodes, UpdateUserCodes, UserRoles } from "@ts/enums";

class UserService {
    public static async getUsersList(query: string, offset: number, limit: number): Promise<IUserData[]> {
        let users: IUserData[] = [];

        try {
            const mainWhereClause = {
                [Op.and]: {
                    [Op.or]: {
                        full_name: {
                            [Op.substring]: query
                        }
                    }
                },
            };

            const dbAccounts = await Account.findAll({
                limit,
                offset,
                include: [
                    {
                      model: Role
                    },
                    {
                      model: Profile,
                      where: mainWhereClause
                    }
                ],
                attributes: {
                    include: [
                        [
                            literal(`(
                                SELECT IF(
                                    EXISTS (
                                        SELECT 1 FROM offers WHERE offers.id_profile = Profile.id_profile
                                    ) OR EXISTS (
                                        SELECT 1 FROM auctions WHERE auctions.id_profile = Profile.id_profile
                                    ) OR EXISTS (
                                        SELECT 1 FROM black_lists WHERE black_lists.id_profile = Profile.id_profile
                                    ),
                                    1,
                                    0
                                )
                            )`),
                            "isActive"
                        ]
                    ]
                }
            });

            const accountsInformation = dbAccounts.map(account => account.toJSON());
            accountsInformation.forEach(account => {
                const roles = account.Roles as any[];

                const {
                    email,
                    Profile,
                    isActive
                } = account;

                let isRemovable: boolean = false;
                if (!isActive && roles[0].name !== UserRoles.ADMINISTRATOR && roles[0].name !== UserRoles.MODERATOR) {
                    isRemovable = true;
                }

                const user: IUserData = {
                    id: Profile.id_profile,
                    fullName: Profile.full_name,
                    email,
                    phoneNumber: Profile.phone_number ?? "",
                    avatar: ImageConverter.bufferToBase64(Profile.avatar),
                    roles: roles.map(role => role.name),
                    isRemovable
                };

                users.push(user);
            });
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the users. ${errorCodeMessage}`
            );
        }

        return users;
    }

    public static async createUser(fullName: string, email: string, phoneNumber: string, avatar: Buffer, password: string): Promise<CreateUserCodes | null> {
        let resultCode: CreateUserCodes | null = null;

        try {
            const sequelize = DataBase.getInstance().getConnection();
            const transaction = await sequelize.transaction();

            if (!Account.sequelize) {
                throw new DataContextException("Sequelize instance is not available");
            }
            const securityService = new SecurityService();
            const hashedPassword = securityService.hashPassword(password);

            const dbAccount = await Account.findOne({
                where: {
                    email
                }
            });

            if (dbAccount !== null) {
                resultCode = CreateUserCodes.EMAIL_ALREADY_EXISTS;
                return resultCode;
            }

            const dbRole = await Role.findOne({
                where: {
                    name: UserRoles.CUSTOMER
                }
            });

            if (dbRole === null) {
                resultCode = CreateUserCodes.CUSTOMER_ROLE_NOT_FOUND;
                return resultCode;
            }

            const profile = await Profile.create(
                { full_name: fullName, phone_number: phoneNumber, avatar },
                { transaction }
            );

            const account = await Account.create(
                { email, password: hashedPassword, id_profile: profile.id_profile },
                { transaction }
            );

            const role = dbRole.toJSON();
            await AccountsRoles.create(
                { id_account: account.id_account, id_rol: role.id_rol },
                { transaction }
            );

            await transaction.commit();
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to register the information of the user. ${errorCodeMessage}`
            );
        }

        return resultCode;
    }

    public static async updateUser(idProfile: number, fullName: string, email: string, phoneNumber: string, avatar: Buffer, password: string): Promise<UpdateUserCodes | null> {
        let resultCode: UpdateUserCodes | null = null;
        
        try {
            const sequelize = DataBase.getInstance().getConnection();
            const transaction = await sequelize.transaction();

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
                        [
                            literal(`(
                                SELECT IF(COUNT(*) > 0, 1, 0)
                                FROM accounts
                                WHERE email = "${email}" AND id_profile != "${idProfile}"
                            )`),
                            "emailAlreadyExists"
                        ]
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

            let hashedPassword: string = "";
            if (password) {
                const securityService = new SecurityService();
                hashedPassword = securityService.hashPassword(password);
            } else {
                const profile = dbProfile.toJSON();
                hashedPassword = profile.password;
            }

            await dbProfile.update(
                { full_name: fullName, phone_number: phoneNumber, avatar },
                { transaction }
            );

            await dbAccount.update(
                { email, password: hashedPassword },
                { transaction }
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

    public static async deleteUser(idProfile: number): Promise<DeleteUserCodes | null> {
        let resultCode: DeleteUserCodes | null = null;
        try {
            const sequelize = DataBase.getInstance().getConnection();
            const dbAccount = await Account.findOne(
                {
                    include: [Role],
                    where: {
                        id_profile: idProfile
                    },
                    attributes: {
                        include: [
                            [
                                literal(`(
                                    SELECT IF(
                                        EXISTS (
                                            SELECT 1 FROM offers WHERE offers.id_profile = ${idProfile}
                                        ) OR EXISTS (
                                            SELECT 1 FROM auctions WHERE auctions.id_profile = ${idProfile}
                                        ) OR EXISTS (
                                            SELECT 1 FROM black_lists WHERE black_lists.id_profile = ${idProfile}
                                        ),
                                        1,
                                        0
                                    )
                                )`),
                                "isActive"
                            ]
                        ]
                    }
                }
            );

            if (dbAccount === null) {
                resultCode = DeleteUserCodes.USER_NOT_FOUND;
                return resultCode;
            }
            const { isActive } = dbAccount.toJSON();
            const account = dbAccount.toJSON();

            const roles = account.Roles as any[];

            if (isActive || roles[0].name === UserRoles.ADMINISTRATOR || roles[0].name === UserRoles.MODERATOR) {
                resultCode = DeleteUserCodes.USER_IS_NOT_REMOVABLE;
                return resultCode;
            }

            await sequelize.transaction(async (t) => {
                await AccountsRoles.destroy({
                    where: { id_account: account.id_account },
                    transaction: t
                });
                await Account.destroy({
                    where: { id_profile: idProfile },
                    transaction: t
                });
                await Profile.destroy({
                    where: { id_profile: idProfile },
                    transaction: t
                });
            });
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to delete user. ${errorCodeMessage}`
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