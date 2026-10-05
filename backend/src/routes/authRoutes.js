import {Router} from "express";
import { registerUser, loginUser } from "../controllers/userControllers.js";
import authenticate from "../middlewares/authenticateMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

//protected routes
router.get("/profile", authenticate, (req, res) => {
    res.send("user profile");
})

export default router;