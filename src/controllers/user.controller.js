import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async(userId) => {
  try{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    //save refresh token in db
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})

    return {accessToken , refreshToken}

  }catch(error){
    throw new ApiError(500 , "Something went wrong while generating tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend based on user model
  const {fullName , email , username , password} = req.body
  // console.log("email : ",email)

  //validation - not empty and you can check more
  if([fullName , email , username , password].some((field)=>field?.trim()==="")){
    throw new ApiError(400 , "All fields are compulsary")
  }

  //check if user already exists : username or email
  const existedUser = await User.findOne({
    $or: [{email},{username}]
  })

  if(existedUser){
    throw new ApiError(409 , "User already exists with this email or username")
  }

  //check for images, check for avatar as required
  // const {avatar , coverImage} = req.files

  const avatarLocalPath = req.files?.avatar[0]?.path
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0]?.path
  }

  if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar is required")
  }

  //upload them to cloudinary , check avatar as required
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

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

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  const {email, username, password} = req.body

  //username or email based access
  if(!username && !email){
    throw new ApiError(400 , "Username or email is required")
  }

  //find the user by email or username
  const user = await User.findOne({
    $or : [{email},{username}]
  })

  if(!user){
    throw new ApiError(404 , "User not found")
  }

  //check for password
  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401 , "Password is incorrect")
  }

  //access and refresh token
  const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)


  //send cookie
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly : true,
    secure : true
  }
  // res.cookie("refreshToken",refreshToken,options)

  //return response
  return res.status(200).cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(200, {user : loggedInUser , accessToken,refreshToken} , "User logged in successfully")
  )

});

const logoutUser = asyncHandler(async (req, res) => {
  //get user id from req.user from middleware (verifyJWT)
  const userId = req.user._id

  //find user and remove refresh token from db
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken : undefined
      }
    },
    {
      new : true
    }
  )

  const options = {
    httpOnly : true,
    secure : true
  }

  //clear the cookies and send response
  return res.status(200).clearCookie("accessToken",options)
  .clearCookie("refreshToken",options).json(
    new ApiResponse(200, null , "User logged out successfully")
  )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

  if(!incomingRefreshToken){
    throw new ApiError(401 , "Unauthorized request")
  }

  //verify token
  try{
      const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  )

  const user = await User.findById(decodedToken?._id)

  if(!user){
    throw new ApiError(401 , "Invalid Refresh Token")
  }

  if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401 , "Token mismatch, please login again")
  }

  //if both matched then generate new
  const options = {
    httpOnly : true,
    secure : true
  }

  const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id)

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken,options).json(
    new ApiResponse(200, {accessToken,newRefreshToken} , "Access token generated successfully")
  )
  }catch(error){
    throw new ApiError(401 , "Invalid Refresh Token")
  }

})


export {registerUser, loginUser , logoutUser,refreshAccessToken}