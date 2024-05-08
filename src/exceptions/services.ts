class DataContextException extends Error {
    constructor(message: string) {
        super(message);

        this.name = "DataContextException";
        Object.setPrototypeOf(this, DataContextException.prototype);
    }
}

export {
    DataContextException
};