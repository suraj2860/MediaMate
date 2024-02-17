import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
});

const port = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${8000}`);
    })
})
.catch((error) => {
    console.log("MONGODB connection failed :: ",error);
})






/*
import express from 'express';

const app = express();

;( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        
        app.on("error", (error) => {
            console.log("ERROR :: ", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("ERROR :: ", error);
    }
})();

*/