import EmailService from "@lib/email_service";
import AuctionService from "./auction_service";

class AuctionClosingService {
    public static async closeAuctions() {
        const expiredAuctions = await AuctionService.getExpiredAuctions();

        for(const auction of expiredAuctions) {
            if(!auction.lastOffer) {
                await AuctionService.closeAuction(auction.id);
            } else {
                await AuctionService.concretizeAuction(auction.id);

                const emailService = new EmailService();
                await emailService.notifySaleToAuctioneer(auction);
                await emailService.notifySaleToCustomer(auction);
                
                await AuctionService.finishAuction(auction.id);
            }
        }
    }
}

export default AuctionClosingService;