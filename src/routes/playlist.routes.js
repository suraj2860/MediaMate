import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, getPlaylistById, getUserPlaylists } from "../controllers/playlist.controller.js";


const router = Router();
router.use(verifyJWT);


router.route("/").post(verifyJWT, createPlaylist);
router.route("/user/:userId").get(verifyJWT, getUserPlaylists);
router.route("/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/add/:videoId/:playlistId").post(verifyJWT, addVideoToPlaylist);


export default router;