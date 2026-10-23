import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import User from "../models/userModel.js";
import {asyncHandler} from "../utils/asynchandler.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateTokens = async(user) => {
    try {
        const accessToken = await jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            },
        );

        const refreshToken = await jwt.sign(
            {
                id: user._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            },
        );

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "error while generating tokens", error)
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if(!name || !email || !password){
        throw new ApiError(400, "All fields are required");
    }

    const isEmailExist = await User.findOne({email});

    if(isEmailExist){
        throw new ApiError(409, "user already exist");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email, 
        password : hashedPassword,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );

    return res.status(201).json(
        new ApiResponse(201, createdUser, "user registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        throw new ApiError(409, "All fields are required");
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, "invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    const loggedInUser = user.toObject();

    delete loggedInUser.password;
    delete loggedInUser.refreshToken;
   
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
        .status(200)
        .header("Authorization", `Bearer ${accessToken}`)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user : loggedInUser,
                    accessToken,
                    refreshToken
                },
                "login successfull"
            )
        )
})

const logoutUser = asyncHandler()

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingToken = req.cookies.refreshToken;
    if(!incomingToken){
        throw new ApiError(400, "refresh token required")
    }

    try {
        const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded.id)

        if(!user){
            throw new ApiError(401, "invalid refresh token")
        }

        if(incomingToken !== user?.refreshToken){
            throw new ApiError(401, "invalid expired or used token");
        }

        const {accessToken, refreshToken} = await generateTokens(user);

        const options = {
            httpOnly : true,
            secure : true,
        }

        return res
            .status(200)
            .header("Authorization", `Bearer ${accessToken}`)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken,
                    },
                    "accessToken refreshed",
                ),
            );


    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token", error);
    }
})

export {registerUser, loginUser, refreshAccessToken}
