import mongoose from "mongoose"
import cloudinary from "cloudinary"
import {app} from "./app.js"
import { connectDatabase } from "./config/database.js"

import {config} from "dotenv"

config({path:"./config/config.env"})

cloudinary.config({ 
    cloud_name: 'dswbi97ea', 
    api_key: '697441261463281', 
    api_secret: 'Eh7-I1XAxr2i9ERrS3DV0kzv6Eg' 
  });

mongoose.set('strictQuery', true);
connectDatabase()
app.get("/",(req,res)=>{
  res.send("<h1>hello world<h1/>")
})

app.listen(process.env.PORT , ()=>{
    console.log("server running on port "+ process.env.PORT)
})

