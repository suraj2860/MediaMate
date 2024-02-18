import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    
    // fething values from request body
    const { username, email, fullName, password } = req.body

    // validation: all fields are required
    if(
        [username, email, fullName, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    // checking if user already exists. If exists, throw error
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // upload avatar and coverImage on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    // upload user in database
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // Checking if the user is successfully uploaded on database. 
    // If true, then creating a user response object and removing the password and refreshToken from it. Else, return server error.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

export { registerUser };
