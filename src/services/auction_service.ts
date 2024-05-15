import { Op, literal } from "sequelize";
import { DataContextException } from "@exceptions/services";
import ImageConverter from "@lib/image_converter";
import Auction from "@models/Auction";
import HypermediaFile from "@models/HypermediaFile";
import Offer from "@models/Offer";
import Profile from "@models/Profile";
import { IAuctionData } from "@ts/data";
import { AuctionStatus } from "@ts/enums";
import AuctionCategory from "@models/AuctionCategory";

class AuctionService {
    public static async getManyAuctions(requesterId: number, query: string, offset: number, limit: number) {
        let auctions: IAuctionData[] = [];

        try {
            const dbAuctions = await Auction.findAll({
                limit,
                offset,
                include: [
                    { 
                        model: Profile,
                        where: {
                            id_profile: {
                                [Op.ne]: requesterId
                            } 
                        }
                    },
                    { 
                        model: HypermediaFile,
                        where: { 
                            mime_type: {
                                [Op.startsWith]: "image/"
                            }
                        },
                        limit: 1
                    },
                    {
                        model: Offer,
                        order: [["creation_date", "DESC"]],
                        separate: true,
                        limit: 1
                    }
                ],
                attributes: {
                    include: [
                        [
                            literal(`(SELECT IF(S.name = "${AuctionStatus.PUBLISHED}", 1, 0) FROM auctions_states_applications AS 
                            H INNER JOIN auction_states AS S ON H.id_auction_state = S.id_auction_state WHERE H.id_auction = 
                            Auction.id_auction ORDER BY H.application_date DESC LIMIT 1)`),
                            "is_public"
                        ]
                    ],
                },
                having:{ ["is_public"]: {[Op.eq]:1}},
                where: query ? {
                    [Op.or]: {
                        title: {
                            [Op.substring]: query
                        },
                        description: {
                            [Op.substring]: query
                        }
                    },
                } : {},
                order: [
                    ["approval_date", "DESC"]
                ]
            });

            const auctionsInformation = dbAuctions.map(auction => auction.toJSON());
            auctionsInformation.forEach(auction => {
                const { 
                    id_auction, 
                    title, 
                    approval_date, 
                    days_available, 
                    Profile: auctioneer, 
                    Offers,
                    HypermediaFiles
                } = auction;
                const closesAt = new Date(approval_date);
                closesAt.setDate(approval_date.getDate() + days_available);

                const auctionData: IAuctionData = {
                    id: id_auction,
                    title,
                    closesAt,
                    auctioneer: {
                        id: auctioneer.id_profile,
                        fullName: auctioneer.full_name,
                        avatar: ImageConverter.bufferToBase64(auctioneer.avatar)
                    }
                }

                if(Array.isArray(Offers) && Offers.length > 0) {
                    const { id_offer, amount, creation_date } = Offers[0];

                    auctionData.lastOffer = {
                        id: id_offer,
                        amount: parseFloat(amount),
                        creationDate: creation_date
                    }
                }

                if(Array.isArray(HypermediaFiles) && HypermediaFiles.length > 0) {
                    const { id_hypermedia_file, content, name, mime_type } = HypermediaFiles[0];

                    auctionData.mediaFiles = [
                        {
                            id: id_hypermedia_file,
                            name,
                            content: ImageConverter.bufferToBase64(content)
                        }
                    ]
                }

                auctions.push(auctionData);
            });
        } catch(error:any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auctions. ${errorCodeMessage}`
            );
        }

        return auctions;
    }

    public static async getUserSalesAuctionsList(userid: number, startDate: string, endDate: string) {
        let auctions: IAuctionData[] = [];
        console.log(userid);
        try {
            const dbAuctions = await Auction.findAll({
                include:[
                    {
                        model: Profile,
                        attributes: ['id_profile'],
                        where:{
                            id_profile: userid
                        }
                    },
                    {
                        model: Offer,
                        where: {
                            creation_date: {
                                [Op.eq]: literal(`(
                                    SELECT MAX(o.creation_date)
                                    FROM offers o
                                    WHERE o.id_auction = Auction.id_auction
                                )`)
                            }
                        }
                    },
                    {
                        model: AuctionCategory,
                        required: true
                    }
                ],
                attributes: {
                    include: [
                        [
                            literal(`(SELECT IF(S.name = "${AuctionStatus.CONCRETIZED}", 1, 0) FROM auctions_states_applications AS 
                            H INNER JOIN auction_states AS S ON H.id_auction_state = S.id_auction_state WHERE H.id_auction = 
                            Auction.id_auction ORDER BY H.application_date DESC LIMIT 1)`),
                            "is_concretized"
                        ]
                    ],
                },
                having:{ ["is_concretized"]: {[Op.eq]:1}}
            });

            const auctionsInformation = dbAuctions.map(auction => auction.toJSON());

            auctionsInformation.forEach(auction => {
                const {
                    id_auction,
                    title,
                    Offers,
                    AuctionCategory: category
                } = auction;

                const auctionData: IAuctionData = {
                    id: id_auction,
                    title,
                    category: {
                        id: category.id_auction_category,
                        title: category.title
                    }
                }

                if(Array.isArray(Offers) && Offers.length > 0) {
                    const { id_offer, amount, creation_date } = Offers[0];

                    auctionData.lastOffer = {
                        id: id_offer,
                        amount: parseFloat(amount),
                        creationDate: creation_date
                    }
                }

                auctions.push(auctionData);
            });
        } catch (error: any) {
            console.log("Di error");
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auctions. ${errorCodeMessage}`
            );
        }

        return auctions;
    }
}

export default AuctionService;