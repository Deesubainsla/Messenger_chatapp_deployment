import mongoose,{Schema, model, Types} from "mongoose";

const schema = new Schema({
    sender:{
        type:Types.ObjectId,
        ref: "User",
        required: true
    },
    chat:{
        type:Types.ObjectId,
        ref: "Chat",
        required: true
    },
    content:{
        type: String,
    },
    attachment:{
        public_id:{
            type:String,
            
        },
        url:{
            type:String,
            
        }
    }
}, {timestamps: true})

const Messege = mongoose.models.Messege || model("Messege", schema)

export default Messege

//mongoose.models.User can't use users because that will be collection we are talking about models models have access of all model