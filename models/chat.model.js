import mongoose,{Schema, model,Types} from "mongoose";

const schema = new Schema({
   
    name:{
        type:String,
        required: true
    },
    groupchat:{
        type:Boolean,
        default: false  //when default value no need for required:
    },
    creator:{
        type:Types.ObjectId,
        ref: "User"
    },
    members:[{
        type:Types.ObjectId,
        ref: "User"
    }],
    latestmsg:{
        type:mongoose.Types.ObjectId,
        ref:"Messege"
    }
    
}, {timestamps: true})

const Chat = mongoose.models.Chat || model("Chat", schema)
export default Chat
//mongoose.models.User can't use users because that will be collection we are talking about models models have access of all model