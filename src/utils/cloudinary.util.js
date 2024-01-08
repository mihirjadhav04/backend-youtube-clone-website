import {v2 as cloudinary} from 'cloudinary';
import fs from "fs" // nodejs filesystem : allows us to read-write-modify in the file. | for file handling.

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto"})
        //file has been uploaded success
        console.log("file has been uploaded successfully on cloudinary: ", response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // to unlink the locally saved tempory file as the upload operation fails.
        console.log("upload to cloudinary failed.");
        return null
    }
}

export { uploadOnCloudinary }

