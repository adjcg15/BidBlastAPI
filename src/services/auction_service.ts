import { Model, Op, literal, where } from "sequelize";
import { DataContextException } from "@exceptions/services";
import ImageConverter from "@lib/image_converter";
import Auction from "@models/Auction";
import HypermediaFile from "@models/HypermediaFile";
import Offer from "@models/Offer";
import Profile from "@models/Profile";
import { IAuctionData, IHypermediaFileData, IOfferData } from "@ts/data";
import { ApproveAuctionCodes, AuctionStatus, BlockUserCodes, GetOffersCodes, RejectAuctionCodes, UserRoles } from "@ts/enums";
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
    public static async getStateIdByName(name: string): Promise<number> {
        const state = await AuctionState.findOne({
            where: { name }
        });
    
        if (!state) {
            throw new DataContextException(`State with name ${name} not found`);
        }
    
        return state.id_auction_state;
    }
    public static async checkItemConditionExists(idItemCondition: number): Promise<boolean> {
        try {
            const itemCondition = await ItemCondition.findByPk(idItemCondition);
            return itemCondition !== null;
        } catch (error: any) {
            console.error("Error checking item condition existence:", error);
            throw new DataContextException("Error while checking item condition existence");
        }
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
            const itemConditionExists = await this.checkItemConditionExists(auctionData.idItemCondition);
            if (!itemConditionExists) {
                throw new DataContextException("Item condition does not exist");
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
                if (file.mimeType.startsWith('image/')) {
                    await HypermediaFile.create(
                        {
                            mime_type: file.mimeType,
                            name: file.name,
                            content: file.content,
                            id_auction: auction.id_auction
                        },
                        { transaction }
                    );
                }
            }
    
            const proposalStateId = await this.getStateIdByName("PROPUESTA");
    
            await AuctionStatesApplications.create(
                {
                    id_auction: auction.id_auction,
                    id_auction_state: proposalStateId,
                    application_date: new Date()
                },
                { transaction }
            );
    
            await transaction.commit();
    
            return auction;
        } catch (error: any) {
            if (transaction) await transaction.rollback();
            throw new DataContextException("Error while creating auction");
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

                let phoneNumber;
                if (phone_number === null) {
                    phoneNumber = "";
                } else {
                    phoneNumber = phone_number;
                }

                const auctionData: IAuctionData = {
                    id: id_auction,
                    title,
                    auctioneer: {
                        id: id_profile,
                        fullName: full_name,
                        phoneNumber,
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
                    base_price,
                    minimum_bid,
                    AuctionStatesApplications: States,
                    AuctionReviews: Review, 
                    Offers,
                    HypermediaFiles
                } = auction;

                let minimumBid;
                if(minimum_bid === null){
                    minimumBid = 0;
                }else{
                    minimumBid = minimum_bid;
                }

                const auctionData: IAuctionData = {
                    id: id_auction,
                    title,
                    minimumBid,
                    basePrice: base_price,
                    daysAvailable: days_available
                }
                
                if (approval_date != null) {
                    const closesAt = new Date(approval_date);
                    closesAt.setDate(approval_date.getDate() + days_available);
                    auctionData.closesAt = closesAt;
                }

                if(Array.isArray(Offers) && Offers.length > 0) {
                    const { id_offer, amount, creation_date, Profile } = Offers[0];

                    let phoneNumber;
                    if (Profile.phone_number === null) {
                        phoneNumber = "";
                    } else {
                        phoneNumber = Profile.phone_number;
                    }

                    auctionData.lastOffer = {
                        id: id_offer,
                        amount: parseFloat(amount),
                        creationDate: creation_date,
                        customer: {
                            id: Profile.id_profile,
                            fullName: Profile.full_name,
                            phoneNumber,
                            avatar: ImageConverter.bufferToBase64(Profile.avatar),
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
            console.log("Entre");
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auctions. ${errorCodeMessage}`
            );
        }

        return auctions;
    }
    
    public static async getUserAuctionOffersByAuctionId(idProfile: number, idAuction: number, offset: number, limit: number): Promise<IOfferData[] | GetOffersCodes> {
        let offers: IOfferData[] = [];
        let resultCode: GetOffersCodes | null = null;

        try {
            const dbAuction = await Auction.findOne({
                where: {
                    id_auction: idAuction, id_profile: idProfile
                }
            });

            if (dbAuction === null) {
                resultCode = GetOffersCodes.AUCTION_NOT_FOUND;
                return resultCode;
            }

            const dbOffers = await Offer.findAll({
                limit,
                offset,
                include: [
                    {
                        model: Profile
                    }
                ],
                where: [
                    {
                        id_auction: idAuction
                    }
                ],
                order: [
                    ["creation_date", "DESC"]
                ]
            });

            const offersInformation = dbOffers.map(offer => offer.toJSON());
            offersInformation.forEach(offer => {
                const {
                    id_offer,
                    amount,
                    creation_date
                } = offer;

                const customerData = offer.Profile;

                const offerData: IOfferData = {
                    id: id_offer,
                    amount,
                    creationDate: creation_date,
                    customer: {
                        id: customerData.id_profile,
                        fullName: customerData.full_name,
                        avatar: ImageConverter.bufferToBase64(customerData.avatar)
                    }
                };

                offers.push(offerData);
            });
        } catch(error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the offers by its auction ID. ${errorCodeMessage}`
            );
        }

        return offers;
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
                    },
                    {
                        model: Offer,
                        order: [["creation_date", "DESC"]],
                        separate: true,
                        limit: 1
                    },
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
                    ItemCondition: { name: itemConditionName },
                    HypermediaFiles: auctionImages,
                    Offers
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
                    itemCondition: itemConditionName,
                    mediaFiles: auctionMediaFiles
                };

                if(Array.isArray(Offers) && Offers.length > 0) {
                    const { id_offer, amount, creation_date } = Offers[0];

                    auction.lastOffer = {
                        id: id_offer,
                        amount: parseFloat(amount),
                        creationDate: creation_date
                    }
                }
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

    public static async blockUserInAnAuctionAndDeleteHisOffers(idAuctioneer: number, idProfile: number, idAuction: number){
        let resultCode: BlockUserCodes | null = null;

        try {
            const dbAuction = await Auction.findOne({
                where: {
                    id_auction: idAuction, id_profile: idAuctioneer
                },
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
                having:{ ["is_public"]: {[Op.eq]:1}}
            });
            if (dbAuction === null) {
                resultCode = BlockUserCodes.AUCTION_NOT_FOUND;
                return resultCode;
            }

            const dbProfile = await Profile.findByPk(idProfile);
            if (dbProfile === null) {
                resultCode = BlockUserCodes.USER_NOT_FOUND;
                return resultCode;
            }

            const dbBlackList = await BlackLists.findOne({
                where: {
                    id_profile: idProfile, id_auction: idAuction
                }
            });
            if (dbBlackList !==  null) {
                resultCode = BlockUserCodes.USER_ALREADY_BLOCKED;
                return resultCode;
            }

            const dbOffer = await Offer.findOne({
                where: {
                    id_profile: idProfile, id_auction: idAuction
                }
            });
            if (dbOffer === null) {
                resultCode = BlockUserCodes.USER_BID_ON_AUCTION_NOT_FOUND;
                return resultCode;
            }

            const creationDate = CurrentDateService.getCurrentDateTime();
            await BlackLists.create(
                {
                    creation_date: creationDate, id_profile: idProfile, id_auction: idAuction
                }
            );
            
            await Offer.destroy({
                where: {
                    id_profile: idProfile, id_auction: idAuction
                }
            });
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                ? `${error.message}. ${errorCodeMessage}`
                : `It was not possible to recover the auction by its ID. ${errorCodeMessage}`
            );
        }

        return resultCode;
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
    public static async publishedAuctions(): Promise<IAuctionData[] | null> {
        let auctions: IAuctionData[] | null = null;
        try {
            const dbAuctions = await Auction.findAll({
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
                            literal(`(SELECT IF(S.name = "${AuctionStatus.PROPOSED}", 1, 0) FROM auctions_states_applications AS 
                            H INNER JOIN auction_states AS S ON H.id_auction_state = S.id_auction_state WHERE H.id_auction = 
                            Auction.id_auction ORDER BY H.application_date DESC LIMIT 1)`),
                            "is_proposed"
                        ]
                    ],
                },
                having: { ["is_proposed"]: { [Op.eq]: 1 } },
            });
    
            if (dbAuctions !== null && dbAuctions.length > 0) {
                auctions = await Promise.all(dbAuctions.map(async dbAuction => {
                    const {
                        id_auction: idAuction,
                        title,
                        approval_date,
                        days_available,
                        description,
                        base_price,
                        minimum_bid,
                        ItemCondition: { name: itemConditionName },
                        HypermediaFiles: auctionImages
                    } = dbAuction.toJSON();
    
                    let closesAt: Date | undefined = undefined;
                    if (approval_date) {
                        closesAt = new Date(approval_date);
                        closesAt.setDate(approval_date.getDate() + days_available);
                    }
    
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
                        .map(({ id_hypermedia_file, mime_type, name, content }) => {
                            const fileData = {
                                id: id_hypermedia_file,
                                mimeType: mime_type,
                                name,
                                content: ""
                            } as IHypermediaFileData;
    
                            if (mime_type.startsWith("image")) {
                                fileData.content = ImageConverter.bufferToBase64(content);
                            }
    
                            return fileData;
                        });
    
                    return {
                        id: idAuction,
                        title,
                        closesAt,
                        days_available,
                        description,
                        basePrice: Number(base_price) || 0,
                        minimumBid: Number(minimum_bid) || 0,
                        itemCondition: itemConditionName,
                        mediaFiles: auctionMediaFiles
                    };
                }));
            } else {
            }
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new DataContextException(
                error.message
                    ? `${error.message}. ${errorCodeMessage}`
                    : `It was not possible to recover the proposed auctions. ${errorCodeMessage}`
            );
        }
    
        return auctions;
    }
    public static async getAuctionStates(): Promise<any[]> {
        /*  
    #swagger.auto = false

    #swagger.path = '/auctions/states'
    #swagger.method = 'get'
    #swagger.produces = ['application/json']
    #swagger.consumes = ['application/json']
    #swagger.tags = ['Auctions']
    #swagger.summary = 'Fetches all available auction states'
    #swagger.responses[200] = {
        description: 'List of auction states',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id_item_condition: {
                        type: 'integer',
                        description: 'The ID of the auction state',
                        example: 1
                    },
                    name: {
                        type: 'string',
                        description: 'The name of the auction state',
                        example: 'Nuevo'
                    }
                }
            }
        }
    }
    #swagger.responses[500] = {
        description: 'Internal server error',
        schema: {
            type: 'object',
            properties: {
                error: {
                    type: 'boolean',
                    description: 'Indicates if there was an error',
                    example: true
                },
                statusCode: {
                    type: 'integer',
                    description: 'The status code of the error',
                    example: 500
                },
                message: {
                    type: 'string',
                    description: 'A detailed error message',
                    example: 'It was not possible to process your request, please try it again later'
                }
            }
        }
    }
    */
        try {
            const itemCondition = await ItemCondition.findAll({
                attributes: ['id_item_condition', 'name']
            });

            return itemCondition.map(state => state.toJSON());
        } catch (error: any) {
            const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
            throw new Error(
                error.message
                    ? `${error.message}. ${errorCodeMessage}`
                    : `It was not possible to recover the auction states. ${errorCodeMessage}`
            );
        }
    }    
}

export default AuctionService;