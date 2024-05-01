import { rateLimit } from "express-rate-limit";

class RateLimiter {
    private static PUBLIC_ENDPOINT_WINDOW_MINUTES = 15;

    public static limitPublicEndpointUse() {
        return rateLimit({
            windowMs: RateLimiter.PUBLIC_ENDPOINT_WINDOW_MINUTES * 60 * 1000,
            limit: 15,
            standardHeaders: "draft-7", 
            legacyHeaders: true,
            message: JSON.stringify({
                error: true,
                details: `Too many request, try again after ${RateLimiter.PUBLIC_ENDPOINT_WINDOW_MINUTES} minutes.`
            }) 
        });
    }
}

export default RateLimiter;