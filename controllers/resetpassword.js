const User = require('../models/user');
const mailSender = require('../utils/mailsender');
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Function to generate reset password token and send email
exports.resetPasswordToken = async (req, res) => {
	try {
		// Email extract kar rahe hain request body se
		const email = req.body.email;
		
		// Check kar rahe hain agar user exist karta hai ya nahi
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({
				success: false,
				message: `This Email: ${email} is not Registered With Us, Enter a Valid Email`,
			});
		}

		// Random token generate kar rahe hain using crypto
		const token = crypto.randomBytes(20).toString("hex");

		// User ka token aur expiry time update kar rahe hain
		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 3600000, // 1 ghante ka expiry time
			},
			{ new: true }
		);
		console.log("DETAILS", updatedDetails);

		// Reset link ke liye URL bana rahe hain
		const url = `http://localhost:3000/update-password/${token}`;

		// Email bhej rahe hain user ko reset password link ke sath
		await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this URL to reset your password.`
		);

		// Response send kar rahe hain ke email successfully send ho gaya
		res.json({
			success: true,
			message:
				"Email Sent Successfully, Please Check Your Email to Continue Further",
		});
	} catch (error) {
		// Error ko handle kar rahe hain agar kuch galat ho jaye
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
	}
};

// Function to reset the password
exports.resetPassword = async (req, res) => {
	try {
		// Request body se password, confirmPassword aur token extract kar rahe hain
		const { password, confirmPassword, token } = req.body;

		// Check kar rahe hain agar password aur confirmPassword match karte hain
		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}

		// Token ke basis pe user details fetch kar rahe hain
		const userDetails = await User.findOne({ token: token });
		if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
		}

		// Check kar rahe hain ke token expire to nahi ho gaya
		if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}

		// Password ko bcrypt se encrypt kar rahe hain
		const encryptedPassword = await bcrypt.hash(password, 10);

		// User ka naya password update kar rahe hain database mein
		await User.findOneAndUpdate(
			{ token: token },
			{ password: encryptedPassword },
			{ new: true }
		);

		// Success message bhej rahe hain jab password reset successful ho jaye
		res.json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		// Agar koi error ho jaye to usko handle kar rahe hain
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};
