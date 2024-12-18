import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        //by null we are specifying the error means if no error(null) then save to "./public/uploads" 
        cb(null, "./public")
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now() + file.originalname);
    }
    
})

const upload = multer({
    storage
});

export default upload