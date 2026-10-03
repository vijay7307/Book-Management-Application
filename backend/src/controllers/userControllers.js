import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { asycHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if(!name || !email || !password || !role){
        return new ApiError(400, "All fields are required");
    }

    const isEmailExist = User.find({email});
    if(isEmailExist){
        return new ApiError(409, "user already exist");
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
