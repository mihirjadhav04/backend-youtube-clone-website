import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

// cookieParser : used so that we can access the user's brower cookies and also set them.

const app = express()

// .use() is used when we are using cors and we can pass a object too in it like below.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// 4 MAIN CONFIGURATION.
//to set configuration and middleware.
app.use(express.json({
    limit: "16kb"
}))

// below is done fro url input data configuration
// with encoded you can give nested objects too. But in most cases you won't be using it.
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

// configuraition for public static assests.
app.use(express.static("public"))
app.use(cookieParser())



export default app