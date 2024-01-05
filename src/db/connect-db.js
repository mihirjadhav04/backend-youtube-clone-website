// here we are writing code to connect to mongodb databse.
import mongoose, { connect } from "mongoose" // importing mongoose
import { DB_NAME } from "../constants.js" // importing db name from constants file

//function is created for db connection with mongodb.
// as db connection can give us errors, so we are using async-await and try catch block to handle that.
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) //on successful connection we get the respone object
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`); // from the response object we are accessing the host url and checcking where we are connected.
    } catch (error) {
        console.log("MongoDB connection error : ", error);
        process.exit(1) // you can access process from anywhere as it is your project ka process where it is running so on failure of db connection the process should be exited.
    }
}

export default connectDB