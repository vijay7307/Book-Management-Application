import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

const authenticate = (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "authentication required");
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );
        req.user = decoded;
        next();

    } catch (error) {
        throw new ApiError(401, "invalid or expired token", error);
    }
}

export default authenticate;