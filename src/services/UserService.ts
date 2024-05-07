import { DataContextException } from "@exceptions/services";
import Account from "@models/Account";
import Profile from "@models/Profile";
import { IUserData } from "@ts/data";

class UserService {
    public static async getUserByEmail(email: string) {
        let user: IUserData | null = null;

        try {
            const profile = await Profile.findOne({
                where: {
                    "$Account.email$": email
                },
                include: Account
            });

            if(profile != null) {
                const profileInformation = profile.toJSON();

                user = {
                    id: profileInformation.id_profile,
                    fullName: profileInformation.full_name,
                    phoneNumber: profileInformation.phone_number,
                    avatar: profileInformation.avatar,
                    email: profileInformation.Account.email,
                    password: profileInformation.Account.password
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