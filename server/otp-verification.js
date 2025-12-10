import nodemailer from "nodemailer";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const DB_PASSWORD = process.env.DB_PASSWORD;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
const generateOTP = async (email) => {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const time = new Date().toISOString();
  // console.log(otp);

  // Store the OTP in MongoDB
  const uri = `mongodb+srv://kundurahul968:${DB_PASSWORD}@cluster0.ftdbemt.mongodb.net/?appName=Cluster0`;
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  try {
    const database = client.db("peace-trail");
    const collection = database.collection("otp-verification");
    const doc = {
      otp: otp,
      time: time,
    };
    const filter = { _id: email };

    const result = await collection.updateOne(
      filter,
      { $set: doc },
      { upsert: true }
    );
    console.log(result);
    if (result.acknowledged) {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "dev.rk.test@gmail.com",
          pass: MAIL_PASSWORD,
        },
      });

      let mailOptions = {
        from: "dev.rk.test@gmail.com",
        to: email,
        subject: "Peace Trail OTP Verification",
        text: `Your OTP for email verification is ${otp}. Valid for 5 minutes.`,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return {status: "success"};
      } catch (error) {
        console.log(error);
        return {status: "fail"};
      }
    }
  } catch (err) {
    console.log("Error: ", err.message);
    return {status: "fail"};
  } finally {
    await client.close();
  }

  // Send the OTP to user's email
};

export { generateOTP };
