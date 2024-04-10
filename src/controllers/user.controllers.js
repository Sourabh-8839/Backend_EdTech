import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import User from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/emailSend.js";

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
const generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      userName: this.userName,
      email: this.email,
      Role: this.Role,
    },
    process.env.ACCESS_TOKEN_SECRETKEY,
    { expiresIn: process.env.ACCESS_TOKEN_TIME_DURATION }
  );
};

// generate Refressh token
const generateRefreshToken = function () {
  return jwt.sign(
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

  // console.log(user);
  const createdUser = await User.findByPk(user.id);

  if (!createdUser) {
    throw new ApiError(500, "Something Went wrong While Creating User");
  }

  await sendEmail(
    createdUser.email,
    "Register Successfully ",
    `Thanks for being awesome!
    
  you are register Succesfully in our app`
  );

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

const accessRefreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized user");
  }

  try {
    const decode = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRETKEY
    );

    const user = await User.findByPk(decode?.id);

    if (!user) {
      throw new ApiError(401, "Invalid refreshToken");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(400, "RefreshToken is expired or used");
    }

    const { accessToken, refreshToken } =
      await genreateRefreshTokenAndaccessToken(user.id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Invalid Refresh Token");
  }
});

const imageUpdate = asyncHandler(async (req, res) => {
  const localFilePath = req?.files?.avatar[0]?.path;

  const user = req.user;

  if (!localFilePath) {
    throw new ApiError(500, "Server Error");
  }
  const avatar = await uploadCloudinary(localFilePath);

  if (!avatar) {
    throw new ApiError(400, "profile picture upload again");
  }

  await User.update(
    { avatar: avatar.url },
    {
      where: {
        id: user.id,
      },
    }
  );

  return res
    .status(200)
    .json(
      new apiResponse(200, { avatar: avatar.url }, "Image update successfully")
    );
});

const updateDetails = asyncHandler(async (req, res) => {
  const user = req.user;

  const { email, userName } = req.body;

  const updateObject = {};

  if (email) {
    updateObject.email = email;
  }

  if (userName) {
    updateObject.userName = userName;
  }

  await User.update(updateObject, {
    where: { id: user.id },
  });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Update Details Succesfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  accessRefreshToken,
  imageUpdate,
  updateDetails,
};
