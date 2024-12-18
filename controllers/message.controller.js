import Messege from "../models/messege.model.js";
import User from "../models/user.model.js";
import wrapper from "../utils/trycatch.wrapper.js";
import { error } from "../middlewares/Error.middleware.js";
import Chat from "../models/chat.model.js";



const getmessages = wrapper(async(req,res)=>{
    const {chatid} = req.query;

    const messages = await Messege.find({chat: chatid}).populate('sender','avatar username').populate('chat','members');

    if(!messages){
        throw new error('Problem in fetching messages',401);
    }

    res.status(200).json({message:"Message fetched successfully",messages});
})

const newmessage = wrapper(async(req,res)=>{

    const {chatid, content} = req.body;

    const user = await User.findOne({_id:req.user}).select('avatar username');

    const chat = await Chat.findOne({_id:chatid}).select("members");

    if(!user){
        throw new error("User not present for Message",401);
    }
    if(!chat){
        throw new error("Chat not present for Message",401);
    }

    const message = await Messege.create({
        sender: req.user,
        chat:chatid,
        content
    })

    if(!message){
        throw new error("Message not created successfully",401);
    }

    chat.latestmsg = message;
    await chat.save();

    const newmessage = {
        sender: user,
        chat,
        content
    }

    res.status(200).json({message:"Message created successfully",newmessage})

})

export {getmessages, newmessage}