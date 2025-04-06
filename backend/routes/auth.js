import express from "express";
import { login, signup, refreshToken, logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/refresh-token",refreshToken);
router.post("/logout", logout);

export default router;
