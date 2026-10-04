import {Router} from "express";
import { registerUser } from "../controllers/userControllers.js";

const router = Router();

router.post("/register", registerUser);

export default router;