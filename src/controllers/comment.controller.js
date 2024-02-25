import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    const comments = await Comment.aggregate([
        {
            $match: { video: video._id }
        },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                totalLikes: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ]);

    if (!comments) {
        throw new ApiError(500, "DB :: something went wrong while fetching comments");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "comments fetched successfully"
            )
        );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { videoId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    const comment = await Comment.create({
        video: videoId,
        content,
        owner: req.user?._id
    });

    if (!comment) {
        throw new ApiError(500, "DB :: something went wrong while adding comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                comment,
                "comment posted successfully"
            )
        );
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "you are not the owner of this comment");
    }

    comment.content = content;
    const updatedComment = await comment.save();

    if (!updatedComment) {
        throw new ApiError(500, "something went wrong while editing comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedComment,
                "comment updated successfully"
            )
        );
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "you are not the owner of this comment");
    }

    const deletedComment = await Comment.deleteOne({ _id: commentId });

    if (!deletedComment) {
        throw new ApiError(500, "DB :: something went wrong while deleting comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedComment,
                "comment removed successfully"
            )
        );
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}