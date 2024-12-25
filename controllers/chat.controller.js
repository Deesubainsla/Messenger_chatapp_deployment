import Chat from "../models/chat.model.js";
import wrapper from "../utils/trycatch.wrapper.js";
import { error } from "../middlewares/Error.middleware.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import Messege from "../models/messege.model.js";

const newGroup = wrapper(async(req, res, next)=>{
    const {groupname , members} = req.body;

    if(!(members.length >= 2)){
        throw new error("Add more members",400);
    }

    const allmembers = [...members, req.user];
    
    // const avatarsid = allmembers.slice(0,3);
    

    // const users = await User.find({_id: {$in: avatarsid}}).select("avatar -_id");
    // const avatar = users.map(user => user.avatar);

    const group = await Chat.create({
        name:groupname,
        groupchat:true,
        creator: req.user,
        members: allmembers,
    })

    res.status(200).json({message:"Groupchat Created successful",group});

})

const newchat = wrapper(async(req, res, next) =>{
    const {senderid} = req.body;
    const sender = await User.findById(senderid).select("name avatar");
    const members = [senderid, req.user];

    const newchat = await Chat.create({
        name: sender.name,
        creator:senderid,
        members,
    })

    res.status(200).json({message:"Chat Created Successfully", newchat});
})

const getchat = wrapper(async(req, res, next) =>{
    
    const chats = await Chat.find({members: req.user}).select("-creator").populate("members","avatar name").populate('latestmsg','sender content').sort({updatedAt: -1});
    //-1 means in descending order
    // 1 means in asscending order


    const transformdata = chats.map(({_id, groupchat,name,members,latestmsg}) => {
        //understand {} as a block of clode not destructring without () in parameter of map

        //to access other members.
        const othermembers = members.filter(({_id}) =>(
                 _id.toString() !== req.user.toString()
        ));
        
        
        return{
            _id,

            groupchat,

            name: groupchat? name : othermembers[0]?.name,

            avatar: groupchat? members.slice(0,3).map(member =>{
                return member.avatar.url;
            })  : [othermembers[0]?.avatar.url],


            //.reduce implementation:
            members: othermembers.reduce((pre, curr)=>{
                pre.push(curr._id);
                return pre;
            },[]),//curr is present looping element of othermembers.

            latestmsg
            //map implementation:
            // members: othermembers.map(member => {
            //     return member._id;
            // })
        }
    })


    res.status(200).json({message:"Chats fetched successfully", transformdata});
})

const getmygroups = wrapper(async(req,res,next)=>{

    const groups = await Chat.find({
        members: req.user,
        groupchat: true,
        creator: req.user
    }).populate("members", "name avatar")

    const transformdata = groups.map(({_id, name, groupchat, members})=>(
        {
            _id,
            groupchat,
            name,
            avatar: members.slice(0,3).map(({avatar})=> avatar.url),
            members: members.map(member => member._id)
        }
    ))

    res.status(200).json({message:"My Groups fetched successfully", transformdata});

})

const addmember = wrapper(async(req,res, next)=>{

    const {chatid, newmembers} = req.body;



    if(!newmembers || newmembers.length < 1){
        throw new error("Members required",400);
    }

    const chat = await Chat.findById(chatid);
    if(!chat){
        throw new error("Chat doesn't exist",400);
    }

    const existingmembers = chat.members.map(id => id.toString());
    const validmembers = newmembers.filter(id => (
        !(existingmembers.includes(id.toString()))
    ))

    //converting validmembers into objectID for save in database.
    const validmembersObjectID = validmembers.map(id => new mongoose.Types.ObjectId(id));

    chat.members = [...chat.members, ...validmembersObjectID];

    await chat.save();

    res.status(200).json({message:"Valid Members added successfully"})

})

const removemember = wrapper(async(req,res,next)=>{

    const {chatid , userid} = req.body;

    //return many promise as a single one.
    const [user, chat] = await Promise.all([
        User.findById(userid),
        Chat.findById(chatid)
    ])

    if(!chat){
        throw new error("Chat not found",400);
    }
    if(!user){
        throw new error("User not found",400);
    }
    if(chat.members.length == 3){
        throw new error("Group has minimum length",400);
    }

    const newmembers = chat.members.filter(id => (
        id.toString() !== userid.toString()
    ))

    chat.members = [...newmembers];

    await chat.save();

    res.status(200).json({message:"User deleted successfully"})

})

const leavegroup = wrapper(async(req,res,next)=>{

    const {chatid} = req.params;

    const chat = await Chat.findById(chatid);
    if(!chat){
        throw new error("Chat not found", 400);
    }

    if(!chat.members.includes(req.user)){
        throw new error("You are not present in the Group",400);
    }

    if(chat.members.length == 3){
        await Chat.deleteOne({_id: chatid});//delete the chat document from database:
        return res.status(200).json({message:"Group removed successfully"})
    }

    const remainingmembers = chat.members.filter(member => member != req.user );
    if(chat.creator == req.user){
        
        const creatorindex = Math.floor(Math.random()*(remainingmembers.length));
        chat.creator = remainingmembers[creatorindex];

    }

    chat.members = [...remainingmembers];
    await chat.save();

    const user = await User.findById(req.user,"name");

    res.status(200).json({message: `${user.name} leaves the group`});

})

const getmychat = wrapper(async(req, res)=>{
    const {chatid} = req.query;
    const realchat = await Chat.findOne({_id: chatid});

    if(!realchat){
        throw new error("Chat not found",401);
    }

    const otheruserid = realchat.members.filter((id)=> id.toString() !== req.user.toString());//would be a array:

    const otheruser = await User.findOne({_id: otheruserid[0]});

    const mychat = {
        ...realchat.toObject(),//first convert it into object because it is a mongodb document first:
        otheruser,
        myid: req.user
    }

    res.status(200).json({message:"Chat found successfullly",mychat});
})

const deletechat = wrapper(async(req,res)=>{

    //delete all the msg related to this chat:

    const {chatid} = req.query;

    const dltmsg = await Messege.deleteMany({chat : chatid});

    const dltchat = await Chat.findByIdAndDelete(chatid);//directly pass the id not object
    if(!dltchat){
        throw new error("Chat not found for delete:",401);
    }

    res.status(200).json({message:"Chat deleted successfully",dltchat});
})

export {newGroup,deletechat, newchat, getchat, getmygroups, addmember,getmychat, removemember, leavegroup}