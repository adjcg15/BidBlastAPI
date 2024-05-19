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
import Account from "@models/Account";
import ItemCondition from "@models/ItemCondition";

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

    public static async getUserSalesAuctionsList(userId: number, startDate: string, endDate: string) {
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
                            id_profile: userId
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

    public static async getCompletedAuctions(userId: number, query: string, offset: number, limit: number) {
        let auctions: IAuctionData[] = [];
        try {
            const mainWhereClause = {
                [Op.and]: {
                    [Op.or]: {
                        title: {
                            [Op.substring]: query
                        },
                        description: {
                            [Op.substring]: query
                        }
                    }
                },
            };
            const dbAuctions = await Auction.findAll({
                limit,
                offset,
                include: [
                    { 
                        model: Profile,
                        include: [
                            {
                                model: Account
                            }
                        ]
                    },
                    { 
                        model: HypermediaFile,
                        where: { 
                            mime_type: {
                                [Op.startsWith]: "image/"
                            }
                        },
                        limit: 1,
                        required: false
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
                            },
                            id_profile: {
                                [Op.eq]: userId
                            }
                        }
                    },
                    {
                        model: AuctionStatesApplications,
                        where: {
                            application_date: {
                                [Op.eq]: literal(`(
                                    SELECT MAX(s.application_date)
                                    FROM auctions_states_applications s
                                    WHERE s.id_auction = Auction.id_auction
                                )`)
                            }
                        }
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
                having:{ ["is_sold"]: {[Op.eq]:1}},
                where: mainWhereClause,
                order: [
                    [AuctionStatesApplications, "application_date", "DESC"]
                ]
            });
            const auctionsInformation = dbAuctions.map(auction => auction.toJSON());
            auctionsInformation.forEach(auction => {
                const { 
                    id_auction, 
                    title,
                    Profile: { 
                        id_profile,
                        full_name,
                        phone_number,
                        avatar, 
                        Account: account 
                      },
                    AuctionStatesApplications: States, 
                    Offers,
                    HypermediaFiles
                } = auction;

                const auctionData: IAuctionData = {
                    id: id_auction,
                    title,
                    auctioneer: {
                        id: id_profile,
                        fullName: full_name,
                        phoneNumber: phone_number,
                        email: account.email,
                        avatar: ImageConverter.bufferToBase64(avatar)
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

    public static async getAuctionById(idAuction: number): Promise<IAuctionData | null> {
        let auction: IAuctionData | null = null;

        try {
            const dbAuction = await Auction.findByPk(idAuction, {
                include: [
                    {
                        model: ItemCondition
                    },
                    {
                        model: HypermediaFile,
                        where: { 
                            mime_type: {
                                [Op.startsWith]: "image/"
                            }
                        },
                        attributes: ["id_hypermedia_file", "mime_type", "name", "content"]
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
            });

            if(dbAuction !== null) {
                const { 
                    title, 
                    approval_date, 
                    days_available,
                    description,
                    base_price,
                    minimum_bid,
                    ItemCondition: { id_item_condition, name: itemConditionName },
                    HypermediaFiles: auctionImages
                } = dbAuction.toJSON();
                const closesAt = new Date(approval_date);
                closesAt.setDate(approval_date.getDate() + days_available);

                const dbAuctionVideos = await HypermediaFile.findAll({
                    where: {
                        [Op.and]: {
                            mime_type: {
                                [Op.startsWith]: "video/"
                            },
                            id_auction: idAuction
                        }
                    },
                    attributes: ["id_hypermedia_file", "mime_type", "name"]
                });
                const auctionVideos = dbAuctionVideos.map(video => video.toJSON());

                const auctionMediaFiles = [...auctionImages, ...auctionVideos]
                    .sort((file1, file2) => file1.id_hypermedia_file - file2.id_hypermedia_file)
                    .map(({id_hypermedia_file, mime_type, name, content}) => {
                        const fileData = {
                            id: id_hypermedia_file,
                            mimeType: mime_type,
                            name,
                            content: ""
                        } as IHypermediaFileData;

                        if(mime_type.startsWith("image")) {
                            fileData.content = ImageConverter.bufferToBase64(content);
                        }

                        return fileData;
                    });

                auction = {
                    id: idAuction,
                    title,
                    closesAt,
                    description,
                    basePrice: Number(base_price) || 0,
                    minimumBid: Number(minimum_bid) || 0,
                    itemCondition: {
                        id: id_item_condition,
                        name: itemConditionName
                    },
                    mediaFiles: auctionMediaFiles
                };
            }
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auction by its ID. ${errorCodeMessage}`
            );
        }

        return auction;
    }
}

export default AuctionService;