import mongoose,{Schema, model} from "mongoose";
import bcrypt from 'bcryptjs'

const userschema = new Schema({
    avatar:{
        public_id:{
            type:String,
            required: true 
        },
        url:{
            type:String,
            required: true
        }
    },
    name:{
        type:String,
        required: true
    },
    username:{
        type:String,
        required: true,
        unique: true
    },
    bio:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true,
        select: false
    }
}, {timestamps: true})


//methods given by default
//schema name is because we have name the const schema for introducing schema:
userschema.pre("save", async function(next){

    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
})

const User = mongoose.models.User || model("User", userschema)
export default User

//mongoose.models.User can't use users because that will be collection we are talking about models models have access of all model