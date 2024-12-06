// For registration
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    // to check as all the field are entered or not
    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "Something is missing from your field !!",
        success: false,
      });
    }

    // to check user with email already exist
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exist with this email !!",
        success: false,
      });
    }

    // change password to hashPassword
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });
    return res.status(200).json({
      message: "Account created successfully !!",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// For Login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is wrong you entered from your field !!",
        success: false,
      });
    }

    // check User by
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password !!",
        success: false,
      });
    }

    // check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password !!",
        success: false,
      });
    }

    // check role
    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role !!",
        success: false,
      });
    }

    // to create a token
    const tokenData = {
      userId: user._id,
    };
    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // user details
    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    // store token in cookie
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpsOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
  }
};

// For Logout
export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged Out successfully !!",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// to update Profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;
    if (!fullName || !email || !phoneNumber || !bio || !skills) {
      return res.status(400).json({
        message: "Something is missing from your field !!",
        success: false,
      });
    }

    // to setup file here from cloudinary

    // skills data into array
    const skillsArray = skills.split(",");
    const userId = req.id; // from middleware authentication

    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "User not found !!",
        success: false,
      });
    }
    // Updating data
    user.fullName = fullName;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.profile.bio = bio;
    user.profile.skills = skillsArray;

    // resume comes later here.......

    // to save updated data
    await user.save();
    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };
    return res.status(200).json({
      message: "Account updated successfully !!",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
