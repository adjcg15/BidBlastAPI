import { DataContextException } from "@exceptions/services";
import CurrentDateService from "@lib/current_date_service";
import Auction from "@models/Auction";
import AuctionReview from "@models/AuctionReview";
import Profile from "@models/Profile";
import { RejectAuctionCodes } from "@ts/enums";

class AuctionReviewService {
    public static async createAuctionReview(comments: string, idAuction: number, idModerator: number) {
        let resultCode: RejectAuctionCodes | null = null;

        try {
            const dbAuction = await Auction.findByPk(idAuction);
            const dbModeratorProfile = Profile.findByPk(idModerator);
            if(dbAuction === null || dbModeratorProfile === null) {
                resultCode = RejectAuctionCodes.DB_MALFORMED;
                return resultCode;
            }

            await AuctionReview.create({
                creation_date: CurrentDateService.getCurrentDateTime(),
                comments,
                id_auction: idAuction,
                id_profile: idModerator
            });
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to create the auction review. ${errorCodeMessage}`
            );
        }

        return resultCode;
    }
}

export default AuctionReviewService;