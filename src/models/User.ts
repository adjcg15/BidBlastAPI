import { RowDataPacket } from "mysql2";
import Model from "./Model";
import { SQLException } from "@exceptions/services";
import { InvalidCredentialsException } from "@exceptions/session";

class User extends Model {
    private _avatar: Buffer | null;
    private _fullName: string;
    private _email: string;
    private _password: string;
    private _phoneNumber: string;
    private _role: string;

    constructor() {
        super();
        this._avatar = null;
        this._fullName = "";
        this._email = "";
        this._password = "";
        this._phoneNumber = "";
        this._role = "";
    }

    get avatar(): Buffer | null { return this._avatar; }
    get fullName() { return this._fullName; }
    get email() { return this._email; }
    get password() { return this._password; }
    get phoneNumber() { return this._phoneNumber; }
    get role() { return this._role; }

    set avatar(avatar: Buffer) { this._avatar = avatar; }
    set fullName(fullName: string) { this._fullName = fullName; }
    set email(email: string) { this._email = email; }
    set password(password: string) { this._password = password; }
    set phoneNumber(phoneNumber: string) { this._phoneNumber = phoneNumber; }
    set role(role: string) { this._role = role; }

    public login(): void {
        let results: RowDataPacket[];
    
        try {
            // const dbResults = await connectionPool.execute<RowDataPacket[]>(
            //     "CALL recover_user_by_email(?)",
            //     [this._email]
            // );
            // results = dbResults[0];
        } catch(error:any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new SQLException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to access to the database. ${errorCodeMessage}`
            );
        }

        // const loginStatus = results[0][0];
        // if(!loginStatus) {
        //     throw new InvalidCredentialsException("Invalid credentials. Check your email and password and try it again");
        // }

        // const securityService = new SecurityService();
        // const isMatchPassword = await securityService.comparePassword(this._password, loginStatus.password);
        // if(!isMatchPassword) {
        //     throw new InvalidCredentialsException("Invalid credentials. Check your email and password and try it again");
        // }

        // this.id = loginStatus.id_account;
        // this.fullName = loginStatus.full_name;
    }
    
    public parse() {
        return {
            id: this._id,
            avatar: this._avatar,
            fullName: this._fullName,
            email: this._email,
            phoneNumber: this._phoneNumber,
            role: this._role
        }
    };
}