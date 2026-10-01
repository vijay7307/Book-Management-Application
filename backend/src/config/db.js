import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionString = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected at HOST : ${connectionString.connection.host}`);
    } catch (error) {
        console.error("Error while connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;