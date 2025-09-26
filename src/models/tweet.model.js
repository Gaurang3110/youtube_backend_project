import mongoose , {Schema} from "mongoose";

const tweetSchema = new Schema({
  
},{timestamps:true})

export const Tweet = new mongoose.model("Tweet" , tweetSchema)