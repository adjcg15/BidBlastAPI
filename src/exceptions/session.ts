class InvalidCredentialsException extends Error {
    constructor(message: string) {
        super(message);

        this.name = "InvalidCredentialsException";
        Object.setPrototypeOf(this, InvalidCredentialsException.prototype);
    }
}

export {
    InvalidCredentialsException
};