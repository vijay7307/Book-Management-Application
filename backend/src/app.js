import express from "express"
const app = express();
import userRouter from "./routes/authRoutes.js";

app.use(express.json());

app.use("/api/user", userRouter)

app.get("/", (req, res) => {
    console.log("ROOT ROUTE HIT");
    res.send("hello vijay!");
});

app.use((err, req, res, next) => {
    console.log("error", err);

    res.status(err.statusCode || 500).json({
        message: err.message,
    });
});

export default app;
