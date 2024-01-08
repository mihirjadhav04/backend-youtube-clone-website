import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
const router = Router()

// middleware added for images using multer.
router.route("/register").post( 
    upload.fields([
        {
            name: "avatar", // field name from front end and backend.
            maxCount: 1 // how many files you want to take
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

export default router