import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { heading, content } = req.body;

  if (!(heading && content)) {
    throw new ApiError(400, "Heading and content are required");
  }
    let imageData = null;
  const imageLocalPath = req.file?.path;

  if (imageLocalPath) {
    //upload on cloudinary
    const image = await uploadOnCloudinary(imageLocalPath);

    if (!image.url) {
      throw new ApiError(
        500,
        "Something went wrong while uploading tweet image"
      );
    }
    imageData = {
      public_id: image.public_id,
      url: image.url,
    };
  }

  const tweet = await Tweet.create({
    heading,
    content,
    owner: req.user?._id,
    image: imageData,
  });

  if (!tweet) {
    throw new ApiError(400, "Tweet creation failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const userTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $sort: { createdAt: -1 }, // optional: newest first
    },
  ]);

  if (!userTweets.length) {
    throw new ApiError(404, "No tweeta for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { heading, content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not allowed to edit this tweet");
  }

  let updateData = {};
  if (heading) updateData.heading = heading;
  if (content) updateData.content = content;

  // handle image if provided
  if (req.file?.path) {
    const imageLocalPath = req.file.path;

    // upload new image
    const image = await uploadOnCloudinary(imageLocalPath);
    if (!image.url) {
      throw new ApiError(500, "Something went wrong while uploading tweet image");
    }

    updateData.image = {
      public_id: image.public_id,
      url: image.url,
    };

    // delete old image if it exists
    if (tweet.image?.public_id) {
      await deleteFromCloudinary(tweet.image.public_id);
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided to update");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, updateData, {
    new: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet Updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this tweet");
  }
  let imageToBeDeleted = null;

  if (tweet.image?.public_id) {
    imageToBeDeleted = tweet.image.public_id;
    await deleteFromCloudinary(imageToBeDeleted);
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet Deleted Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
