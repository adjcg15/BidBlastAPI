import { Op, literal } from "sequelize";
import { DataContextException } from "@exceptions/services";
import ImageConverter from "@lib/image_converter";
import Auction from "@models/Auction";
import HypermediaFile from "@models/HypermediaFile";
import Offer from "@models/Offer";
import Profile from "@models/Profile";
import { IAuctionData, IHypermediaFileData } from "@ts/data";
import { AuctionStatus } from "@ts/enums";
import AuctionCategory from "@models/AuctionCategory";
import AuctionStatesApplications from "@models/AuctionsStatesApplications";
import { GetManyAuctionsConfigParamType } from "@ts/services";
import { Transaction } from "sequelize";

class AuctionService {
    public static async getManyAuctions({ 
        requesterId, query, offset, limit, 
        categoriesAllowed, maximumPrice, minimumPrice }: GetManyAuctionsConfigParamType
    ) {
        let auctions: IAuctionData[] = [];
        const categoryWhereClause = categoriesAllowed.length !== 0
            ? { id_auction_category: { [Op.in]: categoriesAllowed } }
            : {};

        const mainWhereClause = query ? {
            [Op.and]: {
                [Op.or]: {
                    title: {
                        [Op.substring]: query
                    },
                    description: {
                        [Op.substring]: query
                    }
                },
                base_price: { [Op.between]: [minimumPrice, maximumPrice] }
            },
        } : { base_price: { [Op.between]: [minimumPrice, maximumPrice] } };

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
                    },
                    {
                        model: AuctionCategory,
                        attributes: ["id_auction_category"],
                        where: categoryWhereClause
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
                where: mainWhereClause,
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
                    const { id_hypermedia_file, content, name } = HypermediaFiles[0];

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
        
        try {
            let whereClause: { [key: string]: any } = {};
            const maxApplicationDateSubquery = literal(`(
                SELECT MAX(s.application_date)
                FROM auctions_states_applications s
                WHERE s.id_auction = Auction.id_auction
            )`);

            if (startDate !== undefined && endDate !== undefined) {
                whereClause = {
                    application_date: {
                        [Op.between]: [startDate, endDate],
                        [Op.eq]: maxApplicationDateSubquery
                    }
                };
            }else{
                whereClause = {
                    application_date: {
                        [Op.eq]: maxApplicationDateSubquery
                    }
                };
            }

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
                        model: AuctionStatesApplications,
                        where: whereClause
                    },
                    {
                        model: AuctionCategory,
                        required: true
                    }
                ],
                attributes: {
                    include: [
                        [
                            literal(`(SELECT IF(S.name = "${AuctionStatus.CONCRETIZED}" OR S.name = "${AuctionStatus.FINISHED}", 1, 0)
                            FROM auctions_states_applications AS H INNER JOIN auction_states AS S ON H.id_auction_state = 
                            S.id_auction_state WHERE H.id_auction = Auction.id_auction ORDER BY H.application_date DESC LIMIT 1)`),
                            "is_sold"
                        ]
                    ],
                },
                having:{ ["is_sold"]: {[Op.eq]:1}}
            });

            const auctionsInformation = dbAuctions.map(auction => auction.toJSON());

            auctionsInformation.forEach(auction => {
                const {
                    id_auction,
                    title,
                    Offers,
                    AuctionStatesApplications: States,
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

                if(Array.isArray(States) && States.length > 0) {
                    const { application_date } = States[0];
                    
                    auctionData.updatedDate = application_date
                }

                auctions.push(auctionData);
            });
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auctions. ${errorCodeMessage}`
            );
        }

        return auctions;
    }

    public static async createAuction(
        auctionData: any,
        mediaFiles: any[],
        userProfileId: number
    ): Promise<Auction> {
        let transaction: Transaction | null = null;

        try {
            if (!Auction.sequelize) {
                throw new DataContextException("Sequelize instance is not available");
            }

            transaction = await Auction.sequelize.transaction();

            const auction = await Auction.create(
                {
                    title: auctionData.title,
                    description: auctionData.description,
                    base_price: auctionData.basePrice,
                    minimum_bid: auctionData.minimumBid,
                    approval_date: auctionData.approvalDate,
                    days_available: auctionData.daysAvailable,
                    id_item_condition: auctionData.idItemCondition,
                    id_auction_category: auctionData.idAuctionCategory,
                    id_profile: userProfileId
                },
                { transaction }
            );

            for (const file of mediaFiles) {
                await HypermediaFile.create(
                    {
                        mime_type: file.mimeType,
                        name: file.name,
                        content: ImageConverter.bufferToBase64(file.content),
                        id_auction: auction.id_auction
                    },
                    { transaction }
                );
            }

            await transaction.commit();

            return auction;
        } catch (error: any) {
            if (transaction) await transaction.rollback();

            console.error("Error creating auction:", error);
            throw new DataContextException("Error while creating auction: " + error.message);
        }
    }
}

export default AuctionService;