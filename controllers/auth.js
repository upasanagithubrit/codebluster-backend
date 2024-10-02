const user = require("../model/usermodel");
const Otp = require("../model/otpmodel");
const otpgenerator = require("otp-generator");
const Profile = require("../model/profilemodel");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
require("dotenv").config();

//sendotp
exports.sendotp = async (req, res) => {
  try {
    //fetch email from req body
    const { email } = req.body;

    //chcek if user exist
    const checkUserPresent = await user.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "user already registered",
      });
    }
    ///generate otp
    var otp = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("otp generated:", otp);

    //check unique otp or not
    const result = await Otp.findOne({ otp: otp });
    while (result) {
      otp = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await Otp.findOne({ otp: otp });
    }

    const otppayload = { email, otp };
    //create an entry in db for otp

    const otpbody = await Otp.create(otppayload);
    console.log(otpbody);

    res.status(200).json({
      success: true,
      message: "otp sent successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signup
exports.Signup = async (req, res) => {
  try {
    //data fetch from req ke body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //validate karlo
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !contactNumber ||
      !otp
    ) {
      return res.statud(403).json({
        success: false,
        message: "All fields are mandatory",
      });
    }
    //match password and confirm passwword
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "password not matched-password and confirmpassword",
      });
    }
    //check user already exist
    const existuser = await user.findOne({ email });
    if (existuser) {
      return res.status(400).json({
        success: false,
        success: "Usere alreasdy exist",
      });
    }

    //find most recent otp stored for the user
    const recentotp = await otp
      .find({ email })
      .sort({ createdAt: -1 }.limit(1));
    console.log("otp from db:", recentotp);
    if (recentotp.length == 0) {
      return res.json({
        success: false,
        message: "otp not found",
      });
    }
    //validate otp
    else if (recentotp !== otp) {
      return res.status(400).json({
        success: false,
        message: "invalid otp",
      });
    }

    //hash password

    const hashedpassword = await bcrypt.hash(password, 10);

    //create entry in db
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    const createuser = await user.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedpassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
    });
    //return response
    return res.status(200).json({
      success: true,
      message: "User is registered successfully",
      createuser,
    });
  } catch (error) {
    console.log("autgh.js me insignup me cxheck catch bloick");
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//login

exports.Login = async (req, res) => {
  try {
    //get data from req body
    const { email, password } = req.body;

    //validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "all fields are required, please try again",
      });
    }

    //user check exist or not
    const existuser = await user
      .findOne({ email })
      .populate("additional details");
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "user is nott registered, pls sign up first",
      });
    }

    //generate token jwt, after paassword match
    const payload = {
      email: existuser.email,
      id: existuser._id,
      accountType: existuser.accountType,
    };
    if (await bcrypt.compare(password, existuser.password)) {
      
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      existuser.token = token;
      existuser.password = undefined;

      //cookie
      //create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 + 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        existuser,
        message: "Logged in successfully",
      });
    }
    else{
      return res.status(401).json({
        success:false,
        message:" password is incorrect",
      })
    }
  } catch (error) {
    console.log("controllers auth.js me in login me check catch bloick");
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//changepassword
exports.changePassword=async(req,res)=>{
  try{

    //get data fromreq body
   
    //get oldpassword, newpassword,confirmpassword
    //validation
    //updatepassword in db

    //send mail -password updated
    //return response

  }catch(error){

  }
}
