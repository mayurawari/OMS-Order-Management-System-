import express from "express";
import {config} from "dotenv";
import cors from "cors";
import connectdb from "./src/constants/db.js";
import Userroute from "./src/routes/Userroute.js";
import productroute from "./src/routes/productsroute.js";
config();

const server = express();

server.use(express.json());
server.use(cors());
server.use("/api",Userroute);
server.use("/api/products",productroute);

const port = process.env.PORT || 8080 
const url = process.env.URL 
server.get("/",(req,res)=>{
    res.send("This is home route");
})

server.listen(port,async()=>{
    try {
        await connectdb(url);
        console.log(`The server is running on port ${port} & connected to db`);
    } catch (error) {
        console.log(error);
    }
})
