import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

//global event handler
app.on("error", (error) => {
  console.error("ERROR: ", error);
  throw error; 
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({limit: "!6kb"}))

//for taking data from url
app.use(express.urlencoded({
  extended:true,
  limit: "16kb"
}))

//to store public assets (public folder)
app.use(express.static("public"))
app.use(cookieParser());

//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter)


export default app;