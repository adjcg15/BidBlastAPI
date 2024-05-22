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
    GET_USER_SALES = "GUSA",
    GET_COMPLETED_AUCTIONS = "GCOA",
    GET_USER_AUCTIONS = "GUAU",
    CREATE_BLOCK_USER = "CRBU",
    CREATE_OFFER = "COFR"
};

enum UserRoles {
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

enum CreateOfferCodes {
    OFFER_OVERCOMED = EndpointContexts.CREATE_OFFER + "-400001", //ya
    AUCTION_NOT_FOUND = EndpointContexts.CREATE_OFFER + "-400002", //ya
    AUCTION_FINISHED = EndpointContexts.CREATE_OFFER + "-400003", //ya
    AUCTION_BLOCKED = EndpointContexts.CREATE_OFFER + "-400004", //ya
    EARLY_OFFER = EndpointContexts.CREATE_OFFER + "-400005", //ya
    MINIMUM_BID_NOT_FULFILLED = EndpointContexts.CREATE_OFFER + "-400006",
    BASE_PRICE_NOT_FULLFILLED = EndpointContexts.CREATE_OFFER + "-400007",
};

export {
    HttpStatusCodes,
    UserRoles,
    AuctionStatus,
    EndpointContexts,
    CreateOfferCodes
};