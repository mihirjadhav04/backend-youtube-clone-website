// require('dotenv').config({path: './env'})


import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js";

import connectDB from "./db/connect-db.js";
import app from "./app.js"

import dotenv from "dotenv"
dotenv.config({
    path: "./env"
})

//these async method will return a PROMISE on successful execution.
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB Connection Failed!!", err);
})







// Method 1: using IIFE and async/await with try catch as db calls can get errors.
// sometimes people using ;()() before iffe just for cleaning purpose.
/*
import express from "express";
const app = express()


( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Error", (error) => {
            console.log("Error:", error);
            throw error
        })

        //listening to app with express on successful db connection.
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error){
        console.error("ERROR:", error);
        throw error
    }
})()
*/