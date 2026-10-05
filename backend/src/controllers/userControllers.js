import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import User from "../models/userModel.js";
import {asyncHandler} from "../utils/asynchandler.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if(!name || !email || !password || !role){
        throw new ApiError(409, "All fields are required");
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
        role,
    })

    return res.status(201).json(
        new ApiResponse(200, user, "user registered successfully")
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

    const token = jwt.sign(
        {
            role : user.role,
            user_id : user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn : "1d"
        }
    )

    res
        .status(200)
        .header("Authorization", `Bearer ${token}`)
        .json(new ApiResponse(200, "login successfull"))

})

export {registerUser, loginUser}
