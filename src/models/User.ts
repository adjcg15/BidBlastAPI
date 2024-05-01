import { RowDataPacket } from "mysql2";
import Model from "./Model";
import { SQLException } from "@exceptions/services";
import { InvalidCredentialsException } from "@exceptions/session";
import DataBase from "@lib/db";
import SecurityService from "@lib/security_service";
import { UserRoles } from "@ts/enums";

class User extends Model {
    private _avatar: Buffer | null;
    private _fullName: string;
    private _email: string;
    private _password: string;
    private _phoneNumber: string;
    private _roles: UserRoles[];

    constructor() {
        super();
        this._avatar = null;
        this._fullName = "";
        this._email = "";
        this._password = "";
        this._phoneNumber = "";
        this._roles = [];
    }

    get avatar(): Buffer | null { return this._avatar; }
    get fullName() { return this._fullName; }
    get email() { return this._email; }
    get password() { return this._password; }
    get phoneNumber() { return this._phoneNumber; }
    get roles() { return this._roles; }

    set avatar(avatar: Buffer) { this._avatar = avatar; }
    set fullName(fullName: string) { this._fullName = fullName; }
    set email(email: string) { this._email = email; }
    set password(password: string) { this._password = password; }
    set phoneNumber(phoneNumber: string) { this._phoneNumber = phoneNumber; }
    set addRole(role: UserRoles) { this._roles = [...this._roles, role]; }

    public async login() {
        let results: RowDataPacket[][];
        const db = DataBase.connection();
    
        try {
            const dbResults = await db.execute<RowDataPacket[][]>(
                "CALL recover_user_by_email(?)",
                [this._email]
            );
            results = dbResults[0];
        } catch(error:any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new SQLException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to access to the database. ${errorCodeMessage}`
            );
        }

        const userInformation = results[0][0];
        const userRoles = results[1];
        
        if(!userInformation) {
            throw new InvalidCredentialsException("Invalid credentials. Check your email and password and try it again");
        }

        const securityService = new SecurityService();
        const isCorrectPassword = await securityService.comparePassword(this._password, userInformation.password);
        if(!isCorrectPassword) {
            throw new InvalidCredentialsException("Invalid credentials. Check your email and password and try it again");
        }

        this._id = userInformation.id_profile;
        this._avatar = userInformation.avatar;
        this._fullName = userInformation.full_name;
        this._roles = userRoles.map(dbRole => dbRole.name as UserRoles);
        this._phoneNumber = userInformation.phone_number ?? "";
    }
    
    public parse() {
        return {
            id: this._id,
            avatar: this._avatar,
            fullName: this._fullName,
            email: this._email,
            phoneNumber: this._phoneNumber,
            roles: this._roles
        }
    };
}

export default User;