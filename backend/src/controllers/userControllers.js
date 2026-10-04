import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import {asyncHandler} from "../utils/asynchandler.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res, next) => {
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

export {registerUser}
