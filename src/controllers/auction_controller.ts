import { Request, Response } from "express";

class AuctionController {
    public static async searchAuction(req: Request, res: Response) {
        console.log(req.query);
        res.send();
    }
}

export default AuctionController;