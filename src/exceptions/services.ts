class SQLException extends Error {
    constructor(message: string) {
        super(message);

        this.name = "SQLException";
        Object.setPrototypeOf(this, SQLException.prototype);
    }
}

export {
    SQLException
};