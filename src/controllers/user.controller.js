import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId) // user object
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshAccessToken()

        console.log("Access Token", accessToken);
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: true })

        return { accessToken, refreshToken}



    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token.")
    }
}


const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "OK!"
    // })
    // These steps is only algorithm.
    // get user details from frontend(for now from postman)
    console.log(req.body);
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
    const existedUser = await User.findOne({
        //operator use search
        $or: [{ username }, { email }]
    })

    if ( existedUser ){
        throw new ApiError(409, "User with email and username already exists.")
    }

    // check for images, check for avatar.
    // ?. - optionally chaining
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0].path

    let coverImageLocalPath;

    if ( req.files && Array.isArray( req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path
    }



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


const loginUser = asyncHandler( async (req, res) => {
    // Take input from the frontend of username/email and password for authentication. (request body)
    // validate the input fields
    // check the input values of the field with our db and authenticate the user. (find the user)
    // password check of the user
    // generate access and refresh token for the user
    // send these tokens in secure cookiees
    // send final response to api.

    const { email, username, password} = req.body

    if(!(username || email)){
        throw ApiError(400, "username or email is required.")
    }

    // as db is in another continent so we use await.
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw ApiError(404, "User does not exist!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw ApiError(401, "Invaild user credentials.")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    console.log(accessToken);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //whenever you want to send cookies, then you need to create options object.
    // this cookies is only modifiable from server and not frontend.
    const options = {
        httpOnly: true,
        secure: true,
    } 

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken}, "User LoggedIn Successfully!")
    )
    


})

const logoutUser = asyncHandler( async (req, res) => {
    // when clicked on logout
    // cookies clear - refresh and access token
    // clear refreshtoken of the user from db.

    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    } 

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out!"))


})


const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request!")
    }
    
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if (!user){
            throw new ApiError(401, "invaild refresh token!")
        }
    
        if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "refresh token is expired or used!")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully!")
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "invaild refresh token")
    }


})

export { registerUser, loginUser , logoutUser, refreshAccessToken}
