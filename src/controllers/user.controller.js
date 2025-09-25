import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// const registerUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend based on user model
  const {fullName , email , username , password} = req.body
  console.log("email : ",email)

  //validation - not empty and you can check more
  if([fullName , email , username , password].some((field)=>field?.trim()==="")){
    throw new ApiError(400 , "All fields are compulsary")
  }

  //check if user already exists : username or email
  const existedUser = User.findOne({
    $or: [{email},{username}]
  })

  if(existedUser){
    throw new ApiError(409 , "User already exists with this email or username")
  }


  //check for images, check for avatar as required
  // const {avatar , coverImage} = req.files

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path

  if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar is required")
  }

  //upload them to cloudinary , check avatar as required
  const avatar = await uploadToCloudinary(avatarLocalPath)
  const coverImage = await uploadToCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400 , "Avatar is required")
  }


  //create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
    email,
    username : username.toLowerCase(),
    password
  })

  //remove password and refresh token from response
  const createdUser = await User.findById(user._id)
  .select(
    "-password -refreshToken"  
  )

  //check for user creation
  if(!createdUser){
    throw new ApiError(500 , "Something went wrong while registering the user")
  }

  //return response else error
  return res.status(201).json(
    new ApiResponse(200, createdUser , "User Registered successfully")
  )

});


export {registerUser}