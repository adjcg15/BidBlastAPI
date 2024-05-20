import { DataContextException } from "@exceptions/services";
import ImageConverter from "@lib/image_converter";
import Account from "@models/Account";
import BlackLists from "@models/BlackLists";
import Profile from "@models/Profile";
import Role from "@models/Role";
import { IUserData } from "@ts/data";

class UserService {
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
                    phoneNumber: accountInformation.Profile.phone_number,
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

    public static async blockUserInAnAuction(id_profile: number, id_auction: number){
        try {
            await BlackLists.create(
                {
                    id_profile, id_auction
                }
            );
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auction by its ID. ${errorCodeMessage}`
            );
        }
    }
}

export default UserService;