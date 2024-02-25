# YouToob - Video Hosting App

Welcome to YouToob, a complete video hosting website that provides a platform for users to upload, share, and engage with videos. This project is built using NodeJS, ExpressJS, MongoDB, and other technologies to ensure a robust and secure video hosting experience.

## Features

- **User Authentication:**
  - Users can create accounts with a secure signup process.
  - Secure authentication using JWT (JSON Web Tokens) and bcrypt for password hashing.

- **Video Management:**
  - Easy video upload functionality for users.
  - Videos are stored securely in the cloud using Cloudinary.
  - Users can like, dislike, and comment on videos.

- **Subscription System:**
  - Users can subscribe to channels they like.
  

- **User Interaction:**
  - Like or dislike videos to express your opinion.
  - Leave comments on videos to engage in discussions.
  - Subscribe or unsubscribe to stay updated on new content.

- **Security Measures:**
  - Passwords are securely hashed using bcrypt for enhanced security.
  - JWTs are used for access tokens, providing a secure and scalable authentication mechanism.

- **File Handling:**
  - Multer is used for handling file uploads, ensuring a smooth video upload process.

## Built With

- **NodeJS:** Server-side JavaScript runtime.
- **ExpressJS:** Web application framework for Node.js.
- **MongoDB:** NoSQL database for efficient and flexible data storage.
- **bcrypt:** Library for password hashing.
- **Mongoose:** MongoDB object modeling for Node.js.
- **Cloudinary:** Cloud-based image and video management platform.
- **JWT:** JSON Web Tokens for secure authentication.
- **Multer:** Middleware for handling file uploads.

## Installation

1. **Clone the repository.**
   ```bash
   git clone https://github.com/suraj2860/YouToob.git
2. **Install dependencies.**
    ```bash
    npm install
    ```
   This will download and install the necessary dependencies for the project.

* Note: Ensure that you have Node.js and npm installed on your machine before running the installation commands.

3. **Set up your environment variables.**
    
    Create a .env file based on the provided .env.sample.

4. **Start the application.**
    ```bash
    npm run dev
    ```
    This command will launch the YouToob application on http://localhost:8000.



5. **Download postman collection for endpoints :** [Download Postman Collection](raw_url_of_your_exported_file)