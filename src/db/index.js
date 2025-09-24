import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//APPROACH 1
const connectDB = async () => {
  try{
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MONGODB CONNECTED ${connectionInstance.connection.host}`);
  }catch(error){
    console.log("MONGODB CONNECTION ERROR" , error)
    process.exit(1);
  }
}

export default connectDB;



//APPROACH 2
/*
import express from "express";
const app = express();

;( async () => {
  try{
    await mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME}`)
    app.on("error",()=>{
      console.log("ERRR : ",error);
      throw error
    })

    app.listen(process.env.PORT,()=>{
      console.log(`Server started at PORT ${process.env.PORT}`)
    })
  }catch(error){
    console.log("ERROR: ",error)
    throw error
  }
})()
*/