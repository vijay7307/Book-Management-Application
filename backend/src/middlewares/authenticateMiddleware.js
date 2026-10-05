import { ApiError } from "../utils/apiError.js";

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        throw new ApiError(401, "authentication required");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = Jwt.varify(
            token,
            process.env.JWT_SECRET
        );
        req.user = decoded;
        next();

    } catch (error) {
        throw new ApiError(401, "invalid or expired token", error);
    }
}

export default authenticate;