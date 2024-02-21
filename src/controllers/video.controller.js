import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if( !title || !description ){
        throw new ApiError(401, "title and description are required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoFileLocalPath) {
        throw new ApiError(401, "videoFile is required");
    }
    if(!thumbnailLocalPath) {
        throw new ApiError(401, "thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if(!videoFile){
        throw new ApiError(401, "cloudinary :: videoFile is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail){
        throw new ApiError(401, "cloudinary :: thumbnail is required");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user?._id,
        title,
        description,
        duration: videoFile.duration
    });

    if(!video) {
        throw new ApiError(500, "DB :: failed to publish video");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                video,
                "video published successfully"
            )
        );

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}