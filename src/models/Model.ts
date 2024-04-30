abstract class Model {
    protected _id: number;

    constructor() {
        this._id = 0;
    }

    get id() { return this._id; }

    set id(id: number) { this._id = id; }

    public abstract parse(): object;
}

export default Model;