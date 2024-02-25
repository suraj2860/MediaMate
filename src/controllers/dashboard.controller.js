import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelStats = await User.aggregate([
        {
            $match: {_id : new mongoose.Types.ObjectId(req.user?._id)}
        },  
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "allVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            likesCount: { $size: "$likes"} 
                        }
                    },
                    {
                        $project: {
                            likes: 0
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalSubscribers: {$size: "$subscribers"},
                totalVideos: {$size: "$allVideos"},
                totalLikes: {$sum: "$allVideos.likesCount"},
                totalViews: {$sum: "$allVideos.views"}
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                createdAt: 1,
                totalSubscribers: 1,
                totalVideos: 1,
                totalLikes: 1,
                totalViews: 1
            }
        }
    ]);

    if(channelStats.length < 1) {
        throw new ApiError(404, "channel not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelStats,
                "channel stats fetched successfully"
            )
        );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const videos = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(req.user?._id)}
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "channel videos fetched successfully"
            )
        );
})

export {
    getChannelStats, 
    getChannelVideos
    }