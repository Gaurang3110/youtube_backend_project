// require('dotenv').config({path : './.env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({path : './.env'});

connectDB()
.then(()=>{
  app.listen(process.env.PORT,()=>{
    console.log(`Server started at PORT ${process.env.PORT}`)
  });
})
.catch((err)=>{
  console.log("ERROR IN DB CONNECTION: ",err);
})



