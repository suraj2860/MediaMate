import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content
    });

    if (!tweet) {
        throw new ApiError(500, "DB :: something went wrong while posting tweet");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                tweet,
                "tweet posted successfully"
            )
        );
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "invalid userId");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "user not found");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: user._id
            }
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
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                totalLikes: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },{
            $project: {
                likes: 0
            }
        }
    ]);

    if (!tweets) {
        throw new ApiError(500, "DB :: something went wrong while fetching tweets");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "tweets fetched successfully"
            )
        );
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "tweet not found");
    }

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "you are not the owner of this tweet");
    }

    tweet.content = content;
    const updatedTweet = await tweet.save();

    if (!updatedTweet) {
        throw new ApiError(500, "something went wrong while editing tweet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTweet,
                "tweet updated successfully"
            )
        );
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "you are not the owner of this tweet");
    }

    const deletedTweet = await Tweet.deleteOne({ _id: tweetId });

    if (!deletedTweet) {
        throw new ApiError(500, "DB :: something went wrong while deleting tweet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedTweet,
                "tweet removed successfully"
            )
        );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}