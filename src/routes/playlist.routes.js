import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";


const router = Router();
router.use(verifyJWT);


router.route("/").post(verifyJWT, createPlaylist);
router.route("/user/:userId").get(verifyJWT, getUserPlaylists);

router.route("/:playlistId")
    .get(verifyJWT, getPlaylistById)
    .delete(verifyJWT, deletePlaylist)
    .patch(verifyJWT, updatePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);

export default router;