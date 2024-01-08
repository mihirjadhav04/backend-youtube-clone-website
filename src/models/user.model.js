import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

 
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // db searching comfort
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, // cloudinary url service.
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url service.
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required."]
    },
    refreshToken: {
        type: String
    }

},
{ timestamps: true }
)

// pre-hook middleware: used just before the saving of the data into db. As we want to encrypt the password.
// here you can't use arrow function as it dont have access to this method so we can't refere our password field in this case.
// Hence we will be using fucntion (){}
userSchema.pre("save", async function (next) {
    // as we want to encryt only when the password is modified.
    if (this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
})

// custom methods for password check and return boolean.
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

// custom method to generate accessToken. You can add async if required but as it is done fast ther is no need mostly.
userSchema.methods.generateAccessToken = function(){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// custom refresh token where you have less payload in sign.
userSchema.methods.generateRefreshAccessToken = function(){
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)