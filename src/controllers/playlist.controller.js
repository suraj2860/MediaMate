import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name) {
        throw new ApiError(400, "name is required");
    }
    
    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id 
    });

    if(!playlist){
        throw new ApiError(500, "something went wrong while creating playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist created successfully"
            )
        );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "invalid userId");
    }

    const user = await User.findById(userId).select("-password -rereshToken");

    if(!user) {
        throw new ApiError(404, "user not found");
    }

    const playlists = await Playlist.find({ owner: userId }).exec();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlists,
                "playlists fetched successfully"
            )
        );
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist fetched successfully"
            )
        );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "invalid playlistId");
    }
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "video not found");
    }

    if(playlist.videos.indexOf(videoId) !== -1) {
        throw new ApiError(400, "video already present in the playlist");
    }
       
    playlist.videos.push(videoId);
    const updatedPlaylist = await playlist.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "video added successfully in the playlist"
            )
        );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}