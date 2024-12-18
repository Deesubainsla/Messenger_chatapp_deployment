import {v2 as cloudinary} from 'cloudinary'
import { error } from '../middlewares/Error.middleware.js'
import fs from 'fs'
import dotenv from 'dotenv'


dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET 
})




const uploadtocloudinary = async(files=[])=>{
    try {

       


        if(!files || files.length == 0){
            throw new error("Files are not present", 401);
        }

        

        const filespromises = files.map(async(localpath)=>{

            //Difference between () and {}
            //() automatically return single statement, {} need return explicitly with block of code:

            //use () only when single statement is there:

            const response = await cloudinary.uploader.upload( localpath ,{
                resource_type: 'auto'
            })

            fs.unlinkSync(localpath);
            const {public_id, url} = response;
            return {public_id, url}; //output.push_back(element);
        });

        const output = await Promise.all(filespromises);//in map it doesn't wait for promise resolve so need it:

        return output;

    } catch (error) {
        files.forEach((localpath)=>{
            fs.unlinkSync(localpath);
        });
        
        console.log("Error in cloudinary upload: ", error.message);
    }
}


export default uploadtocloudinary;