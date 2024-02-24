import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);


router.route("/:videoId")
    .post(verifyJWT, addComment)
    .get(verifyJWT, getVideoComments);

router.route("/c/:commentId")
    .patch(verifyJWT, updateComment)
    .delete(verifyJWT, deleteComment);


export default router;