import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(401, "Invalid Video ID");
  }

  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (!isLiked) {
    await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video Liked Successfully"));
  } else {
    await Like.findByIdAndDelete(isLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video Unliked Successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(401, "Invalid Comment ID");
  }

  const isLiked = await Like.findOne({
    comment: commentId,
    owner: req.user?._id,
  });
  if (!isLiked) {
    await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment liked successfully"));
  } else {
    await Like.findByIdAndDelete(isLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Invalid tweet id");
  }

  const isLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (!isLiked) {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet liked successfully"));
  } else {
    await Like.findByIdAndDelete(isLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.aggregate([
    {
        $match : {
            likedBy : new mongoose.Types.ObjectId(req.user?._id)
        }
    },
    {
        $lookup : {
            localField : "video",
            from : "videos",
            foreignField : "_id",
            as : "likedVideos",
            pipeline : [
                {
                    $lookup : {
                        localField : "owner",
                        from : "users",
                        foreignField : "_id",
                        as : "owner",
                        pipeline : [
                            {
                                $project : {
                                    fullName : 1,
                                    "avatar.url" : 1,
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        $sort : {
            createdAt : -1,
        }
    },
    {
        $project : {
            _id : 0,
            likedVideos : {
                "thumbnail.url" : 1,
                title : 1,
                description : 1,
                duration : 1,
                views : 1,
                owner : 1,
                createdAt : 1,
            }
        }
    }
  ])

  if(!likedVideos){
    throw new ApiError(404 , "No liked videos found")
  }

  return res
  .status(200)
  .json(new ApiResponse(200 , likedVideos , "Liked Videos Fetched Successfully"))
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
