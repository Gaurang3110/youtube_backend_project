import mongoose , {Schema, trusted} from "mongoose";

const subscriptionSchema = new Schema({
  subscriber : {
    type : mongoose.Schema.Types.ObjectId, //who is subscribing
    ref : 'User',
  },
  channel : {
    type : mongoose.Schema.Types.ObjectId, //one to whon 'subscriber' subscribed
    ref : 'User',
  },
},{timestamps:true})

export const Subscription = mongoose.model('Subscription', subscriptionSchema);