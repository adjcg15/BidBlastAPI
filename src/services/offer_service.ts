import { DataContextException } from "@exceptions/services";
import CurrentDateService from "@lib/current_date_service";
import Auction from "@models/Auction";
import BlackLists from "@models/BlackLists";
import Offer from "@models/Offer";
import { AuctionStatus, CreateOfferCodes } from "@ts/enums";
import { Op, literal } from "sequelize";

class OfferService {
    public static async createOffer(idAuction: number, idUser: number, offerAmount: number): Promise<CreateOfferCodes | null> {
        const ACCEPTED_PERIOD_BETWEEN_OFFERS = 10;
        let resultCode = null;

        try {
            const dbAssociatedAuction = await Auction.findByPk(idAuction, {
                attributes: {
                    include: [
                        [
                            literal(`(SELECT IF(S.name != "${AuctionStatus.PUBLISHED}", 1, 0) 
                            FROM auctions_states_applications AS 
                            H INNER JOIN auction_states AS S ON H.id_auction_state = S.id_auction_state WHERE H.id_auction = 
                            Auction.id_auction ORDER BY H.application_date DESC LIMIT 1)`),
                            "is_closed"
                        ]
                    ],
                }
            });
            if(dbAssociatedAuction === null) {
                resultCode = CreateOfferCodes.AUCTION_NOT_FOUND;
                return resultCode;
            }

            const associatedAuctionData = dbAssociatedAuction.toJSON();
            if(associatedAuctionData.id_profile === idUser) {
                resultCode = CreateOfferCodes.AUCTION_OWNER;
                return resultCode;
            }

            if(associatedAuctionData.is_closed) {
                resultCode = CreateOfferCodes.AUCTION_FINISHED;
                return resultCode;
            }

            const dbBlackListRegister = await BlackLists.findOne({
                where: {
                    [Op.and]: {
                        id_profile: idUser,
                        id_auction: idAuction
                    }
                }
            });
            if(dbBlackListRegister !== null) {
                resultCode = CreateOfferCodes.AUCTION_BLOCKED;
                return resultCode;
            }

            const dbOwnLastOffer = await Offer.findOne({
                where: {
                    [Op.and]: {
                        id_profile: idUser,
                        id_auction: idAuction
                    }
                },
                order: [["creation_date", "DESC"]],
                attributes: ["creation_date"]
            });
            if(dbOwnLastOffer !== null) {
                const { creation_date } = dbOwnLastOffer.toJSON();
                const ownLastOfferDate = new Date(creation_date);
                const now = new Date();

                const minutesElapsedSinceOwnLastOffer = (now.getTime() - ownLastOfferDate.getTime()) / (1000 * 60);
                if(minutesElapsedSinceOwnLastOffer <= ACCEPTED_PERIOD_BETWEEN_OFFERS) {
                    resultCode = CreateOfferCodes.EARLY_OFFER;
                    return resultCode;
                }
            }

            const dbLastOffer = await Offer.findOne({
                where: {
                    id_auction: idAuction,
                },
                order: [["amount", "DESC"]]
            });
            
            let lastOfferAmount = 0;
            if(dbLastOffer !== null) {
                const lastOfferData = dbLastOffer.toJSON();
                lastOfferAmount = parseFloat(lastOfferData.amount);
            }

            if(lastOfferAmount >= offerAmount) {
                resultCode = CreateOfferCodes.OFFER_OVERCOMED;
                return resultCode;
            }

            let { base_price: auctionBasePrice, minimum_bid: auctionMinimumBid } = associatedAuctionData;
            if(!auctionMinimumBid) {
                auctionMinimumBid = 0;
            }
            auctionBasePrice = parseFloat(auctionBasePrice);
            auctionMinimumBid = parseFloat(auctionMinimumBid);
            
            if(offerAmount < auctionBasePrice) {
                resultCode = CreateOfferCodes.BASE_PRICE_NOT_FULLFILLED;
                return resultCode;
            }

            if(auctionMinimumBid >= (offerAmount - lastOfferAmount)) {
                resultCode = CreateOfferCodes.MINIMUM_BID_NOT_FULFILLED;
                return resultCode;
            }

            await Offer.create({
                amount: offerAmount,
                creation_date: CurrentDateService.getCurrentDateTime(),
                id_profile: idUser,
                id_auction: idAuction
            });
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auctions. ${errorCodeMessage}`
            );
        }

        return resultCode;
    }
}

export default OfferService;