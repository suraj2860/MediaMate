import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // file has been uploaded successfully
        //console.log(" File is uploaded on cloudinary :: ", response.url);

        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath); // remove locally saved temporary file as the upload operation got failed
        return null;
    }
};

const deleteFromClodinary = async (publicId) => {
    try {

        await cloudinary.api.delete_resources([publicId]);

    } catch (error) {
        console.log("Error occured while deleting resources from cloudinary");
    }
}

export { uploadOnCloudinary, deleteFromClodinary };