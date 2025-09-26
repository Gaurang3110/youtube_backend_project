import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const uploadOnCloudinary = async (localFilePath) =>{
      try { 
        if(!localFilePath) return null;
        //upload to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath ,{
          resource_type : "auto"
        })
        //file has been uploaded
        // console.log("File successfully uploaded on cloudinary" , response.url)

        fs.unlink(localFilePath) //remove the file from local storage

        return response
      } catch(error){
        //remove the locally saced temp file as upload failed
        fs.unlink(localFilePath)
        return null
      }
    }

    const deleteFromCloudinary = async(public_id , resource_type = "image") =>{
      try{
        if(!public_id){
          return null
        }
        await cloudinary.uploader.destroy(public_id, {
          resource_type : resource_type,
        })
      }catch(error){
        console.log("error deleting from cloudinary",error)
        return null
      }
    }

    export {uploadOnCloudinary,deleteFromCloudinary}
    
  
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    