import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(400, "channelId is required");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channelId");
    }

    const channel = await User.findById(channelId).select("username");

    if (!channel) {
        throw new ApiError(404, "channel not found");
    }

    if(channelId.toString() === req.user?._id.toString()) {
        throw new ApiError(400, "cannot subscribe your own channel");
    }

    const isSubscribed = await Subscription.findOne({
        $and: [
            { channel: channelId },
            { subscriber: req.user?._id }
        ]
    });

    if(!isSubscribed) {
        const subscribe = await Subscription.create({
            channel: channelId,
            subscriber: req.user?._id
        });

        if(!subscribe) {
            throw new ApiError(500, "DB :: something went wrong while subscribing the channel");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    subscribe,
                    "channel subscribed successfully"
                )
            );
    } else {
        const unsubscribe = await Subscription.findByIdAndDelete(isSubscribed._id);

        if(!unsubscribe) {
            throw new ApiError(500, "DB :: something went wrong while unsubscribing the channel");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    unsubscribe,
                    "channel unsubscribed successfully"
                )
            ); 
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "channelId is required");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channelId");
    }

    const channel = await User.findById(channelId).select("username");

    if (!channel) {
        throw new ApiError(404, "channel not found");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
            $unwind: "$subscriber"
        },
        {
            $addFields: {
                subscriber: "$subscriber"
            }
        },
        {
            $project: {
                subscriber: 1,
                subscribedOn: "$createdAt"
            }
        }
    ]);

    if(!subscribers) {
        throw new ApiError(500, "DB :: something went wrong while fetching subscribers");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "subscribers fetched successfully"
            )
        );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "subscriberId is required");
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "invalid subscriberId");
    }

    const user = await User.findById(subscriberId).select("username");

    if (!user) {
        throw new ApiError(404, "user not found");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName:1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $addFields: {
                channel: "$channel"
            }
        },
        {
            $project: {
                channel: 1,
                subscribedOn: "$createdAt"
            }
        }
    ]);

    if(!subscribedChannels) {
        throw new ApiError(500, "DB :: something went wrong while fetching subscribed channels");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "subscribed channels fetched successfully"
            )
        );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}