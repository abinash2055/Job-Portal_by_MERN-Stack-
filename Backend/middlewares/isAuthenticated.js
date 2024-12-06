import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // if token doesn't exist
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User is not Authenticated !!",
        success: false,
      });
    }
    // if token exist
    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid Token !!",
        success: false,
      });
    }
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error);
  }
};
export default isAuthenticated;
