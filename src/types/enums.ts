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
}

export {
    HttpStatusCodes,
    UserRoles,
    AuctionStatus
};