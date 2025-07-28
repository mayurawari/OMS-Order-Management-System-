import mongoose from "mongoose"


const connectdb = async(url)=>{
   await mongoose.connect(url);
}

export default connectdb;