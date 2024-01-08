import { Router } from "express"
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
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

router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

export default router