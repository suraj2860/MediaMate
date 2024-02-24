import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content }= req.body;

    if(!content) {
        throw new ApiError(400, "content is required");
    }

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content
    });

    if(!tweet) {
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

    const tweets = await Tweet.aggregatePaginate(
        {
            $match: { video: userId }
        },
        {
            page: parseInt(page),
            limit: parseInt(limit)
        }
    );
    
    if(!tweets) {
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

    const{ tweetId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "tweet not found");
    }

    if(!content) {
        throw new ApiError(400, "content is required");
    }

    if(tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "you are not the owner of this tweet");
    }

    tweet.content = content;
    const updatedTweet = await tweet.save();

    if(!updatedTweet) {
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

    const{ tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "tweet not found");
    }

    if(tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "you are not the owner of this tweet");
    }

    const deletedTweet = await Tweet.deleteOne({_id: tweetId});
    
    if(!deletedTweet) {
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