import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo-DB connected to Backend Successfully");
  } catch (error) {
    console.log("Somethings error in Database connection", error);
  }
};

export default connectDB;
