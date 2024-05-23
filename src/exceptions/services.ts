class DataContextException extends Error {
    constructor(message: string) {
        super(message);

        this.name = "DataContextException";
        Object.setPrototypeOf(this, DataContextException.prototype);
    }
}

class SMTPException extends Error {
    constructor(message: string) {
        super(message);

        this.name = "SMTPException";
        Object.setPrototypeOf(this, SMTPException.prototype);
    }   
}

export {
    DataContextException,
    SMTPException
};