import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, updateAccountDetails, getCurrentUser, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    );

router.route("/login").post(loginUser);


// secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post( verifyJWT, changeCurrentPassword);

router.route("/update-user-details").post(verifyJWT, updateAccountDetails);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-user-avatar").post(
    verifyJWT,
    upload.fields([{
        name: "avatar",
        maxCount: 1
    }]),
    updateUserAvatar);

router.route("/update-user-coverImage").post(
    verifyJWT,
    upload.fields([{
        name: "coverImage",
        maxCount: 1
    }]), 
    updateUserCoverImage);


export default router;
