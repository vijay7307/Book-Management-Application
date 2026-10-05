import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "authentication required");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        console.log(decoded);
        req.user = decoded;
        next();

    } catch (error) {
        throw new ApiError(401, "invalid or expired token", error);
    }
}

export default authenticate;