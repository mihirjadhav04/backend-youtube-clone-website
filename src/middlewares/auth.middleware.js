// verify is user is present of not.
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized Request!")
        }
        console.log("Token", token);
    
    
        const decodedTokenInformation = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedTokenInformation?._id).select("-password -refreshToken")
    
        if (!user){
        
            throw new ApiError(401, "Invalid Access Token!")
        }
    
        req.user = user
        next()
    } catch (error) {
       throw new ApiError(401, error?.message || "Error while verifying token from JWT.") 
    }

})