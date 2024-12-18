import mongoose,{Schema, model} from "mongoose";

const schema = new Schema({
    sender:{
        type:Types.ObjectId,
        ref: "User"
    },
    reciver:{
        type:Types.ObjectId,
        ref: "User"
    },
    status:{
        type: String,
        default: "pending",
        enum: ["pending", "rejected", "accepted"] //only have one of these values otherwise show validate error:
    }
}, {timestamps: true})

const Request = mongoose.models.Request || model("Request", schema)

//mongoose.models.User can't use users because that will be collection we are talking about models models have access of all model