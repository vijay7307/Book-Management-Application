import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        minlength : 2,
        maxlength : 30
    },
    role : {
        type : String,
        enum : ["user", "admin"],
        default : "user"
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true
    },
    password : {
        type : String,
        required : true,
    }
})

const User = mongoose.model("User", userSchema);

export default User;