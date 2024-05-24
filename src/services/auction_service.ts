import { Op, literal } from "sequelize";
import { DataContextException } from "@exceptions/services";
import ImageConverter from "@lib/image_converter";
import Auction from "@models/Auction";
import HypermediaFile from "@models/HypermediaFile";
import Offer from "@models/Offer";
import Profile from "@models/Profile";
import { IAuctionData, IHypermediaFileData, IOfferData } from "@ts/data";
import { ApproveAuctionCodes, AuctionStatus, RejectAuctionCodes, UserRoles } from "@ts/enums";
import AuctionCategory from "@models/AuctionCategory";
import AuctionStatesApplications from "@models/AuctionsStatesApplications";
import { GetManyAuctionsConfigParamType } from "@ts/services";
import { Transaction } from "sequelize";
import Account from "@models/Account";
import AuctionState from "@models/AuctionState";
import ItemCondition from "@models/ItemCondition";
import BlackLists from "@models/BlackLists";
import CurrentDateService from "@lib/current_date_service";
import AuctionReviews from "@models/AuctionReviews";
import Role from "@models/Role";
import AccountsRoles from "@models/AccountsRoles";

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

    public static async getCreatedAuctions(userId: number, query: string, offset: number, limit: number) {
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
                        attributes: ['id_profile'],
                        where:{
                            id_profile: userId
                        }
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
                        include: [
                            {
                            model: Profile,
                                include: [
                                    {
                                        model: Account
                                    }
                                ]
                            }
                        ],
                        order: [["creation_date", "DESC"]],
                        separate: true,
                        limit: 1
                    },
                    {
                        model: AuctionStatesApplications,
                        include: [
                            {
                                model: AuctionState
                            }
                        ],
                        where: {
                            application_date: {
                                [Op.eq]: literal(`(
                                    SELECT MAX(s.application_date)
                                    FROM auctions_states_applications s
                                    WHERE s.id_auction = Auction.id_auction
                                )`)
                            }
                        }
                    },
                    {
                        model: AuctionReviews
                    }
                ],
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
                    approval_date, 
                    days_available,
                    minimum_bid,
                    AuctionStatesApplications: States,
                    AuctionReviews: Review, 
                    Offers,
                    HypermediaFiles
                } = auction;
                const closesAt = new Date(approval_date);
                closesAt.setDate(approval_date.getDate() + days_available);

                const auctionData: IAuctionData = {
                    id: id_auction,
                    title,
                    closesAt,
                    minimumBid: minimum_bid,
                    daysAvailable: days_available
                }

                if(Array.isArray(Offers) && Offers.length > 0) {
                    const { id_offer, amount, creation_date, Profile } = Offers[0];

                    auctionData.lastOffer = {
                        id: id_offer,
                        amount: parseFloat(amount),
                        creationDate: creation_date,
                        customer: {
                            id: Profile.id_profile,
                            fullName: Profile.full_name,
                            phoneNumber: Profile.phone_number,
                            avatar: Profile.avatar,
                            email: Profile.Account.email
                        }
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
                    const { application_date, AuctionState } = States[0];
                    
                    auctionData.updatedDate = application_date;
                    auctionData.auctionState = AuctionState.name;
                }

                if(Array.isArray(Review) && Review.length > 0) {
                    const { id_auction_review, creation_date, comments } = Review[0];
                    
                    auctionData.review = {
                        id: id_auction_review,
                        creationDate: creation_date,
                        comments
                    }
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

    public static async blockUserInAnAuction(id_profile: number, id_auction: number){
        try {
            const creation_date = CurrentDateService.getCurrentDateTime();
            await BlackLists.create(
                {
                    creation_date, id_profile, id_auction
                }
            );
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auction by its ID. ${errorCodeMessage}`
            );
        }
    }

    public static async getExpiredAuctions(): Promise<IAuctionData[]> {
        const expiredAuctions: IAuctionData[] = [];

        try {
            const dbExpiredAuctions = await Auction.findAll({
                attributes: {
                    include: [
                        [
                            literal(`(SELECT IF(S.name = "${AuctionStatus.PUBLISHED}", 1, 0) FROM auctions_states_applications AS 
                            H INNER JOIN auction_states AS S ON H.id_auction_state = S.id_auction_state WHERE H.id_auction = 
                            Auction.id_auction ORDER BY H.application_date DESC LIMIT 1)`),
                            "is_public"
                        ],
                        [
                            literal(`(SELECT DATE_ADD(approval_date, INTERVAL days_available DAY) 
                            FROM auctions WHERE id_auction = Auction.id_auction)`),
                            "expiration_date"
                        ]
                    ]
                },
                having: { 
                    [Op.and]: {
                        ["is_public"]: {[Op.eq]:1},
                        ["expiration_date"]: {[Op.lte]:CurrentDateService.getCurrentDateTime()}
                    }
                },
                include: [
                    {
                        model: Profile,
                        include: [
                            { model: Account }
                        ]
                    },
                    {
                        model: Offer,
                        order: [["amount", "DESC"]],
                        limit: 1,
                        include: [
                            {
                                model: Profile,
                                include: [
                                    { model: Account }
                                ]
                            }
                        ]
                    }
                ]
            });

            dbExpiredAuctions.map(dbAuction => {
                const { 
                    id_auction, 
                    description, 
                    base_price: basePrice, 
                    minimum_bid: minimumBid, 
                    approval_date, 
                    title,
                    days_available,
                    Profile: auctioneer,
                    Offers: offers
                } = dbAuction.toJSON();
                const closesAt = new Date(approval_date);
                closesAt.setDate(approval_date.getDate() + days_available);
                
                const lastOfferData = offers[0];
                let lastOffer: IOfferData | undefined = undefined;
                if(lastOfferData !== undefined) {
                    lastOffer = {
                        id: lastOfferData.id_offer,
                        creationDate: new Date(lastOfferData.creation_date),
                        amount: parseFloat(lastOfferData.amount) || 0,
                        customer: {
                            id: lastOfferData.Profile.id_profile,
                            fullName: lastOfferData.Profile.full_name || "",
                            phoneNumber: lastOfferData.Profile.phone_number || "",
                            email: lastOfferData.Profile.Account.email
                        }
                    }
                }

                expiredAuctions.push({
                    id: id_auction,
                    title,
                    description,
                    basePrice: parseFloat(basePrice),
                    minimumBid: parseFloat(minimumBid) || 0,
                    closesAt,
                    auctioneer: {
                        id: auctioneer.id_profile,
                        fullName: auctioneer.full_name || "",
                        phoneNumber: auctioneer.phone_number || "",
                        email: auctioneer.Account.email
                    },
                    lastOffer
                });
            });
        } catch(error:any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the expired auctions. ${errorCodeMessage}`
            );
        }

        return expiredAuctions;
    }

    public static async closeAuction(idAuction: number) {
        try {
            const dbAuction = await Auction.findByPk(idAuction);
            if(dbAuction !== null) {
                const dbClosedState = await AuctionState.findOne({
                    where: {
                        name: AuctionStatus.CLOSED
                    }
                });

                if(dbClosedState !== null) {
                    const { id_auction_state } = dbClosedState.toJSON();

                    await AuctionStatesApplications.create({
                        id_auction: idAuction,
                        id_auction_state,
                        application_date: CurrentDateService.getCurrentDateTime()
                    });
                }
            }
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to close the auction. ${errorCodeMessage}`
            );
        }
    }

    public static async concretizeAuction(idAuction: number) {
        try {
            const dbAuction = await Auction.findByPk(idAuction);
            if(dbAuction !== null) {
                const dbConcretizedState = await AuctionState.findOne({
                    where: {
                        name: AuctionStatus.CONCRETIZED
                    }
                });

                if(dbConcretizedState !== null) {
                    const { id_auction_state } = dbConcretizedState.toJSON();

                    await AuctionStatesApplications.create({
                        id_auction: idAuction,
                        id_auction_state,
                        application_date: CurrentDateService.getCurrentDateTime()
                    });
                }
            }
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to concretize the auction. ${errorCodeMessage}`
            );
        }
    }

    public static async finishAuction(idAuction: number) {
        try {
            const dbAuction = await Auction.findByPk(idAuction);
            if(dbAuction !== null) {
                const dbFinishedState = await AuctionState.findOne({
                    where: {
                        name: AuctionStatus.FINISHED
                    }
                });

                if(dbFinishedState !== null) {
                    const { id_auction_state } = dbFinishedState.toJSON();

                    await AuctionStatesApplications.create({
                        id_auction: idAuction,
                        id_auction_state,
                        application_date: CurrentDateService.getCurrentDateTime()
                    });
                }
            }
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to finish the auction. ${errorCodeMessage}`
            );
        }
    }

    public static async publishAuction(idAuction: number, idAuctionCategory: number) {
        let resultCode: ApproveAuctionCodes | null = null;

        try {
            const dbAuction = await Auction.findByPk(idAuction, {
                attributes: {
                    include: [
                        [
                            literal(`(SELECT IF(S.name = "${AuctionStatus.PROPOSED}", 1, 0) FROM auctions_states_applications AS 
                            H INNER JOIN auction_states AS S ON H.id_auction_state = S.id_auction_state WHERE H.id_auction = 
                            Auction.id_auction ORDER BY H.application_date DESC LIMIT 1)`),
                            "isWaitingEvaluation"
                        ]
                    ]
                }
            });

            if(dbAuction === null) {
                resultCode = ApproveAuctionCodes.AUCTION_NOT_FOUND;
                return resultCode;
            }

            const { isWaitingEvaluation } = dbAuction.toJSON();
            if(!isWaitingEvaluation) {
                resultCode = ApproveAuctionCodes.AUCTION_ALREADY_EVALUATED;
                return resultCode;
            }
            
            const dbPublishedState = await AuctionState.findOne({
                where: {
                    name: AuctionStatus.PUBLISHED
                }
            });
            if(dbPublishedState === null) {
                resultCode = ApproveAuctionCodes.DB_MALFORMED;
                return resultCode;
            }

            const dbAuctionCategory = await AuctionCategory.findByPk(idAuctionCategory);
            if(dbAuctionCategory === null) {
                resultCode = ApproveAuctionCodes.CATEGORY_NOT_FOUND;
                return resultCode;
            }

            const { id_auction_state } = dbPublishedState.toJSON();
            await AuctionStatesApplications.create({
                id_auction: idAuction,
                id_auction_state,
                application_date: CurrentDateService.getCurrentDateTime()
            });

            dbAuction.approval_date = CurrentDateService.getCurrentDateTime();
            dbAuction.id_auction_category = idAuctionCategory;
            await dbAuction.save();
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to publish the auction. ${errorCodeMessage}`
            );
        }

        return resultCode;
    }

    public static async rejectAuction(idAuction: number) {
        let resultCode: RejectAuctionCodes | null = null;

        try {
            const dbAuction = await Auction.findByPk(idAuction, {
                attributes: {
                    include: [
                        [
                            literal(`(SELECT IF(S.name = "${AuctionStatus.PROPOSED}", 1, 0) FROM auctions_states_applications AS 
                            H INNER JOIN auction_states AS S ON H.id_auction_state = S.id_auction_state WHERE H.id_auction = 
                            Auction.id_auction ORDER BY H.application_date DESC LIMIT 1)`),
                            "isWaitingEvaluation"
                        ]
                    ]
                }
            });
            if(dbAuction === null) {
                resultCode = RejectAuctionCodes.AUCTION_NOT_FOUND;
                return resultCode;
            }

            const { isWaitingEvaluation } = dbAuction.toJSON();
            if(!isWaitingEvaluation) {
                resultCode = RejectAuctionCodes.AUCTION_ALREADY_EVALUATED;
                return resultCode;
            }

            const dbRejectedState = await AuctionState.findOne({
                where: {
                    name: AuctionStatus.REJECTED
                }
            });
            if(dbRejectedState === null) {
                resultCode = RejectAuctionCodes.DB_MALFORMED;
                return resultCode;
            }

            const { id_auction_state } = dbRejectedState.toJSON();
            await AuctionStatesApplications.create({
                id_auction: idAuction,
                id_auction_state,
                application_date: CurrentDateService.getCurrentDateTime()
            });
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to reject the auction. ${errorCodeMessage}`
            );
        }

        return resultCode;
    }

    public static async convertAuctionAuthorToAuctioneer(idAuction: number) {
        let resultCode: ApproveAuctionCodes | null = null;
        
        try {
            const dbAuction = await Auction.findByPk(
                idAuction,
                {
                    include: {
                        model: Profile,
                        attributes: ["id_profile"],
                        include: [
                            {
                                model: Account,
                                attributes: ["id_account"],
                                include: [
                                    {
                                        model: Role
                                    }
                                ]
                            }
                        ]
                    }
                }
            );
            if(dbAuction == null) {
                resultCode = ApproveAuctionCodes.AUCTION_NOT_FOUND;
                return resultCode;
            }

            const { Profile: auctioneer } = dbAuction.toJSON();
            const { Account: { Roles: auctioneerRoles, id_account } } = auctioneer;

            if(!auctioneerRoles.some((role: any) => role.name === UserRoles.AUCTIONEER)) {
                const dbAuctioneerRole = await Role.findOne({
                    where: {
                        name: UserRoles.AUCTIONEER
                    }
                });

                if(dbAuctioneerRole === null) {
                    resultCode = ApproveAuctionCodes.DB_MALFORMED;
                    return resultCode;
                }
                
                const { id_rol } = dbAuctioneerRole.toJSON();
                await AccountsRoles.create({
                    id_account,
                    id_rol
                });
            }
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to assign the role AUCTIONEER to the author of auction with ID ${idAuction}. ${errorCodeMessage}`
            );
        }

        return resultCode;
    }
}

export default AuctionService;