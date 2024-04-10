import ForgotPassword from "../models/forgetpasswordreq.model.js";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/asyncHandler.js";

const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });

  console.log(user);

  if (!user) {
    throw new ApiError(404, "User not Existed");
  }

  const id = uuidv4();

  await ForgotPassword.create({
    uuId: id,
    UserId: user.id,
    isActive: true,
  });

  const sendEmailForResetPassword = async (email, Subject, msg) => {
    const resend = new Resend(process.env.EMAIL_PRIVATE_KEY);

    const { data, error } = await resend.emails.send({
      from: `sourabh.iwi@gmail.com`,
      to: [`${email}`],
      subject: `Reset Password`,
      text: "Dont Worry you can click below link",
      html: `<h1>Click below link to change Password</h1>
          <a href="http://localhost:4000/password/resetpassword/${id}">Reset password</a>`,
    });

    if (error) {
      throw new ApiError(400, error?.message || "Unable To send email");
    }
  };

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        sendEmailForResetPassword,
        "Succesfully send reset email"
      )
    );
});

const resetpassword = async (req, res) => {
  try {
    const id = req.params.id;

    console.log(id);

    await ForgotPassword.findOne({ uuId: id }).then((forgotpasswordrequest) => {
      console.log(forgotpasswordrequest);

      if (forgotpasswordrequest.isActive) {
        forgotpasswordrequest.update({ isActive: false });

        res.status(200).send(`<html>
                                        <script>
                                            function formsubmitted(e){
                                                e.preventDefault();
                                                console.log('called')
                                            }
                                        </script>
    
                                        <form action="/password/updatepassword/${id}" method="get">
                                            <label for="newpassword">Enter New password</label>
                                            <input name="newpassword" type="password" required></input>
                                            <button>reset password</button>
                                        </form>
                                    </html>`);
        res.end();
      } else {
        res.send("This link is expire plz. try again");
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};

const updatepassword = async (req, res) => {
  try {
    const { newpassword } = req.query;
    const { resetId } = req.params;

    const resetPassword = await ForgotPassword.findOne({
      where: { uuId: resetId },
    });

    const user = await User.findOne({ where: { id: resetPassword.UserId } });

    if (user) {
      //encrypt the password

      const saltRounds = 10;

      bcrypt.hash(newpassword, saltRounds, async function (err, hash) {
        // Store hash in your password DB.
        if (err) {
          console.log(err);
          throw new Error(err);
        }

        await user.update({ password: hash });

        return res
          .status(201)
          .json(
            new apiResponse(
              201,
              {},
              { message: "Successfuly update the new password" }
            )
          );
      });
    } else {
      return res.status(404).json({ error: "No user Exists", success: false });
    }
  } catch (error) {
    return res.status(403).json({ error: error.message, success: false });
  }
};

export { resetpassword, forgotPasswordController, updatepassword };
