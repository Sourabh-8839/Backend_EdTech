import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import User from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: true,
};

const hashMap = async (password) => {
  return await bcrypt.hash(password, 10);
};

const isPasswordCorrect = async (incomingPassword, password) => {
  return await bcrypt.compare(incomingPassword, password);
};

//generate access token
const generateAccessToken = async function () {
  return jwt.sign(
    {
      id: this.id,
      userName: this.userName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRETKEY,
    { expiresIn: process.env.ACCESS_TOKEN_TIME_DURATION }
  );
};

// generate Refressh token
const generateRefreshToken = async function () {
  return await jwt.sign(
    {
      id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRETKEY,
    { expiresIn: process.env.REFRESH_TOKEN_TIME_DURATION }
  );
};

const genreateRefreshTokenAndaccessToken = async (user_id) => {
  try {
    const user = await User.findByPk(user_id);

    const accessToken = await generateAccessToken.call(user);

    const refreshToken = await generateRefreshToken.call(user);

    user.refreshToken = refreshToken;

    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while genrating refresh and access Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, Role } = req.body;

  if (
    [userName, email, password, Role].some(
      (field) => field?.trim === "" || field === undefined
    )
  ) {
    throw new ApiError(400, "All fields Required");
  }

  const existedEmail = await User.findOne({ where: { email: email } });

  if (existedEmail) {
    throw new ApiError(400, "Email is already Existed");
  }

  const hashPassword = await hashMap(password);

  const user = await User.create({
    userName: userName.toLowerCase(),
    email,
    password: hashPassword,
    Role: Role.toLowerCase(),
  });

  console.log(user);
  const createdUser = await User.findByPk(user.id);

  if (!createdUser) {
    throw new ApiError(500, "Something Went wrong While Creating User");
  }

  return res
    .status(200)
    .json(new apiResponse(200, createdUser, "User register Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(401, "email is required");
  }

  const user = await User.findOne({
    where: { email: email },
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isValidPassword = await isPasswordCorrect(password, user.password);

  console.log(isValidPassword);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await genreateRefreshTokenAndaccessToken(user.id);

  const updatedUser = await User.findByPk(user.id, {
    attributes: ["id", "userName", "email"],
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: updatedUser,
          accessToken,
          refreshToken,
        },
        "User login succesfully "
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  await User.update(
    { refreshToken: "" },
    {
      where: { id: user.id },
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logout Succesfully "));
});

export { registerUser, loginUser, logoutUser };
