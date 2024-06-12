enum HttpStatusCodes {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500
};

enum EndpointContexts {
    LOGIN = "LOGN",
    GET_ALL_CATEGORIES = "GACT",
    GET_CATEGORY_BY_ID = "GCBI",
    MODIFY_CATEGORY_BY_ID = "MCBI",
    CREATE_CATEGORY = "CRCT",
    GET_ALL_AUCTIONS = "GAAU",
    GET_AUCTION_BY_ID = "GABI",
    CREATE_AUCTION = "CRAU",
    CREATE_USER = "CRUS",
    UPDATE_USER = "UPUS",
    DELETE_USER = "DEUS",
    GET_USER_SALES = "GUSA",
    GET_COMPLETED_AUCTIONS = "GCOA",
    GET_USER_AUCTIONS = "GUAU",
    GET_OFFERS_BY_AUCTION = "GOBA",
    CREATE_BLOCK_USER = "CRBU",
    CREATE_OFFER = "COFR",
    APPROVE_AUCTION = "APAU",
    REJECT_AUCTION = "RJAU"
};

enum UserRoles {
    ADMINISTRATOR = "ADMINISTRATOR",
    CUSTOMER = "CUSTOMER",
    AUCTIONEER = "AUCTIONEER",
    MODERATOR = "MODERATOR"
};

enum AuctionStatus {
    PROPOSED = "PROPUESTA",
    PUBLISHED = "PUBLICADA",
    REJECTED = "RECHAZADA",
    CLOSED = "CERRADA",
    CONCRETIZED = "CONCRETADA",
    FINISHED = "FINALIZADA"
};

enum CreateUserCodes {
    EMAIL_ALREADY_EXISTS = EndpointContexts.CREATE_USER + "-400001",
    CUSTOMER_ROLE_NOT_FOUND = EndpointContexts.CREATE_USER + "-400002"
}

enum UpdateUserCodes {
    EMAIL_ALREADY_EXISTS = EndpointContexts.UPDATE_USER + "-400001",
    PROFILE_NOT_FOUND = EndpointContexts.UPDATE_USER + "-400002",
    ACCOUNT_NOT_FOUND = EndpointContexts.UPDATE_USER + "-400003"
}

enum DeleteUserCodes {
    USER_IS_NOT_REMOVABLE = EndpointContexts.DELETE_USER + "-400001",
    USER_NOT_FOUND = EndpointContexts.DELETE_USER + "-400002"
}

enum CreateOfferCodes {
    OFFER_OVERCOMED = EndpointContexts.CREATE_OFFER + "-400001",
    AUCTION_NOT_FOUND = EndpointContexts.CREATE_OFFER + "-400002",
    AUCTION_FINISHED = EndpointContexts.CREATE_OFFER + "-400003",
    AUCTION_BLOCKED = EndpointContexts.CREATE_OFFER + "-400004",
    EARLY_OFFER = EndpointContexts.CREATE_OFFER + "-400005",
    MINIMUM_BID_NOT_FULFILLED = EndpointContexts.CREATE_OFFER + "-400006",
    BASE_PRICE_NOT_FULLFILLED = EndpointContexts.CREATE_OFFER + "-400007",
    AUCTION_OWNER = EndpointContexts.CREATE_OFFER + "-400008",
};

enum ApproveAuctionCodes {
    AUCTION_NOT_FOUND = EndpointContexts.APPROVE_AUCTION + "-400001",
    CATEGORY_NOT_FOUND = EndpointContexts.APPROVE_AUCTION + "-400002",
    AUCTION_ALREADY_EVALUATED = EndpointContexts.APPROVE_AUCTION + "-400003",
    DB_MALFORMED = EndpointContexts.APPROVE_AUCTION + "-500001"
}

enum RejectAuctionCodes {
    AUCTION_NOT_FOUND = EndpointContexts.REJECT_AUCTION + "-400001",
    AUCTION_ALREADY_EVALUATED = EndpointContexts.REJECT_AUCTION + "-400002",
    DB_MALFORMED = EndpointContexts.REJECT_AUCTION + "-500001"
}

enum ModifyAuctionCategoryCodes {
    CATEGORY_NOT_FOUND = EndpointContexts.MODIFY_CATEGORY_BY_ID + "-400001",
    TITLE_ALREADY_EXISTS = EndpointContexts.MODIFY_CATEGORY_BY_ID + "-400002", 
}

enum CreateAuctionCategoryCodes {
    TITLE_ALREADY_EXISTS = EndpointContexts.MODIFY_CATEGORY_BY_ID + "-400001"
}

enum GetOffersCodes {
    AUCTION_NOT_FOUND = EndpointContexts.GET_OFFERS_BY_AUCTION + "-400001",
    OFFERS_NOT_FOUND = EndpointContexts.GET_OFFERS_BY_AUCTION + "-400002"
}

enum BlockUserCodes {
    AUCTION_NOT_FOUND = EndpointContexts.CREATE_BLOCK_USER + "-400001",
    USER_NOT_FOUND = EndpointContexts.CREATE_BLOCK_USER + "-400002",
    USER_ALREADY_BLOCKED = EndpointContexts.CREATE_BLOCK_USER + "-400003",
    USER_BID_ON_AUCTION_NOT_FOUND = EndpointContexts.CREATE_BLOCK_USER + "-400004"
}
enum CreateAuctionCodes {
    INVALID_REQUEST_DATA = EndpointContexts.CREATE_AUCTION + "400001",
    AUCTION_CREATION_ERROR = EndpointContexts.CREATE_AUCTION + "500001",
    INVALID_ITEM_CONDITION = EndpointContexts.CREATE_AUCTION + "-400002"
}

export {
    HttpStatusCodes,
    UserRoles,
    CreateUserCodes,
    UpdateUserCodes,
    DeleteUserCodes,
    AuctionStatus,
    EndpointContexts,
    CreateOfferCodes,
    ApproveAuctionCodes,
    RejectAuctionCodes,
    ModifyAuctionCategoryCodes,
    CreateAuctionCategoryCodes,
    GetOffersCodes,
    BlockUserCodes,
    CreateAuctionCodes
};