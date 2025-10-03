import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//VIDEOs

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})
const addCommentToVideo = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateVideoComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteVideoComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

//TWEETs

const getTwetComments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query
    const { tweetId } = req.params
})

const addCommentToTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
})

const updateTweetComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
})

const deleteTweetComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
})

export {
    getVideoComments, 
    addCommentToVideo, 
    updateVideoComment,
    deleteVideoComment,
    getTwetComments,
    addCommentToTweet,
    updateTweetComment,
    deleteTweetComment,
}
