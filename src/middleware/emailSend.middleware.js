import { Resend } from "resend";

const otpGenrator = () => {
  let otp = 0;
  for (let i = 0; i < 6; i++) {
    otp = otp * 10 + Math.floor(Math.random() * 10);
  }

  return otp;
};

const sendEmailForVerification = async (req, res, next) => {
  const { email } = req.body;
  const otp = otpGenrator();

  const resend = new Resend(process.env.EMAIL_PRIVATE_KEY);

  const { data, error } = await resend.emails.send({
    from: `sourabh.iwi@gmail.com`,
    to: [`${email}`],
    subject: "Verifiction of Email",
    html: `<strong>Do not share otp  </strong>
          <span> ${otp}</span>
    `,
  });

  if (error) {
    return res.status(400).json({ error });
  }

  next();
};

export { sendEmailForVerification };
