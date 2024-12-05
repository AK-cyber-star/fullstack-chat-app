import Express from "express";

import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = Express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

// calls each time whenever we refresh the page
router.get("/check", protectRoute, checkAuth);

export default router;