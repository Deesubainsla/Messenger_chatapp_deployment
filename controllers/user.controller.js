import User from '../models/user.model.js'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import { error } from '../middlewares/Error.middleware.js';
import wrapper from '../utils/trycatch.wrapper.js';
import uploadtocloudinary from '../utils/cloudinary.js';
import upload from '../middlewares/multer.middleware.js';
import Messege from '../models/messege.model.js';
import Chat from '../models/chat.model.js';

const cookieoptions = {
    maxAge: 15*24*60*60*1000 ,//15 days
    secure: true,//only sharable on https
    httpOnly: true,//only access by http req not by javaScript
    sameSite:"none", //to allow cross-origin
    // path:'/'
};

const {compare} = bcrypt;

const signin = wrapper(
    async(req,res) => {

    //     console.log("req.body", req.body);
    //     console.log("req.file", req.file);
    //     // console.log("req.file.path ",req.file.path);
    //     // console.log("req.file[0].path ",req.file[0].path);
    // //    console.log( "req.file.path: " ,req.file.path);
    // //    console.log("key Trial: ",process.env.CLOUDINARY_NAME);
    //    const profilepath = req.file.path;
    //     const result = await uploadtocloudinary([profilepath]);
    //     console.log("Cloudinary output: ",result);
    //     res.status(200);
        const {name, username, bio, password} = req.body;

        const existuser = await User.findOne({username});
        if(existuser){
            throw new error("User already exist",401);
        }

        var avatar;
        const file = req.file;
        if(file){
            const output = await uploadtocloudinary([file.path]);
            avatar = {
                public_id: output[0].public_id,
                url: output[0].url
            }
        }
        else{
            avatar = {
                public_id: req.body.avatar,
                url: req.body.avatar
            }
        }
        
        
        

        const user = await User.create({
             name,
             username,
             bio,
             avatar,
             password
        });

        if(!user){
            throw new error("Unable to create user",400);
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

        // console.log("Normal token: ",token);

        // console.log("decoded token: ", jwt.decode(token)); //does't verify

        //More safe and adopted with verification.
        // jwt.verify(token, process.env.JWT_SECRET,(err, data)=>{
            
        //    console.log("verified token: ",data);
            
        // });
        
        res
        .status(201)
        .cookie("user",token, cookieoptions)
        .json({messege:"user created successfully",user});
    }
)

const login = wrapper(
    async(req, res, next) => {

        const {username, password} = req.body;
        

        const user = await User.findOne({username}).select("+password");
        if(!user){
            throw new error("User not found",404);
        }

        const isMatch = await compare(password, user.password);
        
        if(!isMatch){
            throw new error("Password is incorrect",400);
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

        res.status(200)
        .cookie("user",token, cookieoptions)
        .json({message:"User loggedin successfully", user})

    }
)

const getmyprofile = wrapper(async(req, res, next) => {

    // const {userid} = req.query;

     const user = await User.findById(req.user);

     if(!user){
        throw new error("User not found",404);
     }

     res.status(200)
    .json({message:"You have got your profile", user})
})

const getanyprofile = wrapper(async(req, res, next) => {

    const {userid} = req.query;

     const user = await User.findById(userid);

     if(!user){
        throw new error("User not found",404);
     }

     res.status(200)
    .json({message:"You have got your profile", user})
})

const logout = wrapper(async(req, res, next) => {

    const user = await User.findOne({_id: req.user});
    if(!user){
        throw new error('User is not present for logout',401);
    }

    res.status(200)
    .clearCookie('user')
    .json({message:"User logout successfully"})

})

const getalluser = wrapper(async(req,res)=>{
    const userid = req.user;

    const chats = await Chat.find({members: userid}).select("members");

    let friendsarray = [userid];
    friendsarray = chats.flatMap(({members})=>members.filter((id)=> id.toString() != userid.toString()))


    const users = await User.find({_id:{$nin:friendsarray}});

    res.status(200).json({message:'user fetched successfully', users});
})

const dltallmsg = wrapper(async(req, res)=>{
    await Messege.deleteMany({});
    res.status(200).json({message:"msges dlted successfully"});
})

export {signin, login, getmyprofile, logout, getalluser,dltallmsg, getanyprofile}