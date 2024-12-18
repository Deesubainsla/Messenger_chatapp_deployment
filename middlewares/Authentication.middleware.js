import jwt from "jsonwebtoken";
import { error } from "./Error.middleware.js";


const isAuthenticated = (req, res , next)=>{

    //three ways of getting
    // const {user} = req.cookies;
    // const user = req.cookies['user']; 
    // const user = req.cookies.user; 

    const token = req.cookies.user;
    // console.log("Token is ",token);
    if(!token){
        next(new error("Login is compulsory",404));
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);
   
   
    req.user = user._id;
    //by this middleware req.user will be available:
   

    next();
}

export default isAuthenticated