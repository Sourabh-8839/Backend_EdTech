import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/registerUser").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);

export default router;
