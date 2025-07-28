import { model, Schema } from "mongoose";

const userschema=new Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    role:{type:String,enum:["admin","user"],default:"user",required:true},
    cart:[
        {
            product: { type: Schema.Types.ObjectId, ref: "products", required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ]
})

const usermodel=model("Users",userschema);

export default usermodel;