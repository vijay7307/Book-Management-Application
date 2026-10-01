import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; 

dotenv.config({
    path: "./src/.env"
});

const PORT = process.env.PORT || 5000;

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log("server started! ");
    });
})
.catch(error => {console.log("server connection failed! ", error)})

