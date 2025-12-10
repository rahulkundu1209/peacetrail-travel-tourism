import nodemailer from "nodemailer";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const DB_PASSWORD = process.env.DB_PASSWORD;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
const uri = `mongodb+srv://kundurahul968:${DB_PASSWORD}@cluster0.ftdbemt.mongodb.net/?appName=Cluster0`;
const generateOTP = async (email) => {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const time = new Date().toISOString();
  // console.log(otp);

  // Store the OTP in MongoDB
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
        return {status: "fail", message: "Failed to send OTP!"};
      }
    }
  } catch (err) {
    console.log("Error: ", err.message);
    return {status: "fail", message: "Failed to save OTP!"};
  } finally {
    await client.close();
  }

  // Send the OTP to user's email
};

const verifyOTP = async (email, otp) =>{
  //Fetch the document from db
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  try{
    const database = client.db("peace-trail");
    const collection = database.collection("otp-verification");
    const doc = await collection.findOne({_id: email});
    console.log(doc);
    const currentTime = new Date();
    const generateTime = new Date(doc.time);
    console.log(currentTime - generateTime);
    if(currentTime - generateTime > 5*60*1000){
      return {status: "invalid", message: "OTP Expired"};
    }else if(otp != doc.otp){
      return {status: "invalid", message: "Wrong OTP"};
    }else if(otp == doc.otp){
      return {status: "success", message: "OTP Verified"};
    }else{
      return {status: "fail", message: "Unknown Error"};
    }
  }catch(error){
    console.log(error.message);
    return {status: "fail", message: error.message}
  }

  //Verify the OTP and send the verification status
}

export { generateOTP, verifyOTP };
