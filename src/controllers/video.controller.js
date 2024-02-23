import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    let videoQuery = {};
    if (query) {
        videoQuery.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {

        if(!isValidObjectId(userId)){
            throw new ApiError(400, "invalid userId");
        }
        const user = await User.findById(userId).select("-password -rereshToken");

        if(!user) {
            throw new ApiError(404, "user not found");
        }
        videoQuery.owner = userId;
    }

    let sortOptions = { createdAt: 1};
    if (sortBy && sortType) {
        sortOptions[sortBy] = sortType === 'asc' ? 1 : -1;
    }

    const videos = await Video.aggregatePaginate(
        videoQuery,
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOptions 
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "videos fetched successfully"
            )
        );
});

const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new ApiError(401, "title and description are required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(401, "videoFile is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(401, "thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if (!videoFile) {
        throw new ApiError(401, "cloudinary :: videoFile is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
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

    if (!video) {
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

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(401, "invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "video fetched successfully"
            )
        );
})

const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you are not the owner of this video");
    }

    const { title, description } = req.body;

    const thumbnailLocalPath = req.file?.path;

    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "atleast enter one of the fields (title, description, or thumbnail) to update");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail?.url
            }
        },
        {
            new: true
        }
    );

    if (updatedVideo && thumbnail) {
        await deleteFromCloudinary(video.thumbnail.split('/').pop().split('.').slice(0, -1).join('.'), "image");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedVideo,
                "video updated successfully"
            )
        );
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const video = await Video.findById(videoId).select(["videoFile", "thumbnail"]);

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you are not the owner of this video");
    }

    const videoDeleted = await Video.findByIdAndDelete(videoId);

    if (!videoDeleted) {
        throw new ApiError(400, "DB :: error occured while deleteing video");
    }

    await deleteFromCloudinary(video.videoFile.split('/').pop().split('.').slice(0, -1).join('.'), "video");
    await deleteFromCloudinary(video.thumbnail.split('/').pop().split('.').slice(0, -1).join('.'), "image");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "video deleted successfully"
            )
        );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you are not the owner of this video");
    }

    video.isPublished = !video.isPublished;

    await video.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "toggled publish status successfully"
            )
        );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}