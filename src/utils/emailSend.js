import { Resend } from "resend";
import { ApiError } from "./apiError.js";

const sendEmail = async (email, Subject, msg) => {
  const resend = new Resend(process.env.EMAIL_PRIVATE_KEY);

  const { data, error } = await resend.emails.send({
    from: `sourabh.iwi@gmail.com`,
    to: [`${email}`],
    subject: `${Subject}`,
    html: `<strong>${msg}</strong>
        
    `,
  });

  console.log(data);

  if (error) {
    throw new ApiError(400, error?.message || "Unable To send email");
  }
};

export { sendEmail };
