import { ApiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { Op } from "sequelize";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "unauthorized user");
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETKEY);

    console.log(decodeToken);

    const user = await User.findByPk(decodeToken.id);

    if (!user) {
      throw new ApiError(400, "Invalid Access Token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid access Token");
  }
});
