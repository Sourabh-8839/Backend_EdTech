import express from "express";
import {
  accessRefreshToken,
  imageUpdate,
  loginUser,
  logoutUser,
  registerUser,
  updateDetails,
} from "../controllers/user.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  forgotPasswordController,
  resetpassword,
  updatepassword,
} from "../controllers/forgetPassword.controller.js";

const router = express.Router();

router.route("/registerUser").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refreshToken").post(accessRefreshToken);

//user Manipulation
router
  .route("/imageUpdate")
  .post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    verifyJwt,
    imageUpdate
  );

router.route("/detailsUpdate").post(verifyJwt, updateDetails);

router.use("/password/forgotpassword", forgotPasswordController);

router.get("/password/resetpassword/:id", resetpassword);

router.get("/password/updatepassword/:resetId", updatepassword);

export default router;
