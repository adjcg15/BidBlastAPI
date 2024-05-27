import AuctionClosingService from "services/auction_closing_service";
import Logger from "./logger";

class Timer {
    public static startAuctionsClosingListener() {
        const EXECUTION_INTERVAL = 1000 * 60 * 5;

        const closeAuctions = () => {
            AuctionClosingService.closeAuctions()
                .catch((error: any) => {  
                    Logger.error(error.name, "Error closing auctions. " + error.message);
                });
        };

        setTimeout(() => {
            closeAuctions();
            setInterval(closeAuctions, EXECUTION_INTERVAL);
        }, EXECUTION_INTERVAL);
    }
}

export default Timer;