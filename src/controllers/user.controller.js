import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/APIResponse.js";


const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "OK!"
    // })
    // These steps is only algorithm.
    // get user details from frontend(for now from postman)
    // console.log(req.body);
    const {fullname, email, username, password} = req.body
    // console.log(("fullname",fullname));

    // validation for fields in our backend. i.e not empty for now.

    // if ( fullname === "") {
    //     throw new ApiError(400, "fullname is required.")
    // }

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


    // check if already user exists(username and email check in db)
    const existedUser = User.findOne({
        //operator use search
        $or: [{ username }, { email }]
    })

    if ( existedUser ){
        throw new ApiError(409, "User with email and username already exists.")
    }

    // check for images, check for avatar.
    // ?. - optionally chaining
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0].path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.")
    }

    // wait till image gets upload.
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar){
        throw new ApiError(400, "Avatar file is required.")
    }
    
    const user = await User.create({
        fullname,
        avatar: avatar.url, // here we are sure 100% image is present
        coverImage: coverImage?.url, // here it is optional so safety check is done. (?.)
        username: username.toLowerCase() ,
        password,
        email,
    })

    //check if user is created of user - extra db call but fullproof
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully!")
    )

    // upload them to cloudinary, avatar.
    // create user object for mongodb as it is nosql - create entry in db.
    // remove password and refresh token field from response.
    // check response for user creation 
    // return response 



})

export { registerUser }
