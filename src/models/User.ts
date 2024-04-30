import Model from "./Model";

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