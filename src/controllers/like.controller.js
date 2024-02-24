import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from '../models/video.model.js'
import { Comment } from '../models/comment.model.js'
import { Tweet } from '../models/tweet.model.js'
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    const isLiked = await Like.findOne(
        {
            $and: [
                { video: videoId },
                { likedBy: req.user?._id }
            ]
        }
    );

    if (!isLiked) {
        const like = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        });

        if (!like) {
            throw new ApiError(500, "DB :: something went wrong while liking the video");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "video liked successfully"
                )
            );
    } else {
        const unlike = await Like.findByIdAndDelete(isLiked._id);

        if (!unlike) {
            throw new ApiError(500, "DB :: something went wrong while unliking the video");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    unlike,
                    "video unliked successfully"
                )
            );
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!commentId) {
        throw new ApiError(400, "commentId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    const isLiked = await Like.findOne(
        {
            $and: [
                { comment: commentId },
                { likedBy: req.user?._id }
            ]
        }
    );

    if (!isLiked) {
        const like = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        });

        if (!like) {
            throw new ApiError(500, "DB :: something went wrong while liking the comment");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "comment liked successfully"
                )
            );
    } else {
        const unlike = await Like.findByIdAndDelete(isLiked._id);

        if (!unlike) {
            throw new ApiError(500, "DB :: something went wrong while unliking the comment");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    unlike,
                    "comment unliked successfully"
                )
            );
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    if(!tweetId) {
        throw new ApiError(400, "tweetId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "tweet not found");
    }

    const isLiked = await Like.findOne(
        {
            $and: [
                { tweet: tweetId },
                { likedBy: req.user?._id } 
            ]
        }
    );

    if(!isLiked) {
        const like = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        });

        if(!like) {
            throw new ApiError(500, "DB :: something went wrong while liking the tweet");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    like,
                    "tweet liked successfully"
                )
            );
    } else {
        const unlike = await Like.findByIdAndDelete(isLiked._id);
        
        if(!unlike) {
            throw new ApiError(500, "DB :: something went wrong while unliking the tweet");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    unlike,
                    "tweet unliked successfully"
                )
            );
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match: {
                $and: [
                    { video: { $exists: true } },
                    { likedBy: req.user?._id }
                ]
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
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
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: { $first: "$video" }
            }
        },
        {
            $project: {
                video: 1
            }
        }
    ]);

    if(!likedVideos) {
        throw new ApiError(500, "DB :: something went wrong while fetching liked videos");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "liked videos fetched successfully"
            )
        );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};