import { Request, Response } from "express";

class OfferController {
    public static async createOffer(req: Request, res: Response): Promise<void> {
        res.send();
    }
}

export default OfferController;