import express from 'express'
import dotenv from 'dotenv'
import DBconnection from './utils/db.connection.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import {errormiddleware} from './middlewares/Error.middleware.js';
import http from 'http'
import {Server} from 'socket.io'
import path from 'path'


import userroute from './routes/user.route.js';
import chatroute from './routes/chat.route.js';
import messageroute from './routes/message.route.js';


dotenv.config()
const onlineuser = new Map();
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:['http://localhost:5173','http://localhost:4173', 'https://messenger-chatapp-frontend.vercel.app/']
    }//cors is important for socket connection
});

io.on('connection',(socket)=>{

    console.log(`Socket connected successfully ${socket.id}`);
    socket.on('setup',(id)=>{
        socket.join(id);
        console.log('own id joined successfully');
    })

    socket.on('user connected',(userid)=>{
        // console.log("userconnected work in backend:")
        onlineuser.set(userid,socket.id);
        io.emit('connected users', Array.from(onlineuser.keys()));
    })

    socket.on('getonlinestatus',()=>{
        io.emit('connected users', Array.from(onlineuser.keys()));
    })

    socket.on('typing',(chat)=>{

        console.log("In serverside typing:",chat);
        if(!chat.members){
            return console.log('Members not present in typing:');
        }

        chat.members.forEach(userid => {
            if(userid == chat.myid) return;
            socket.in(userid).emit('typing',chat);
        });
    })
    socket.on('stop typing',(chat)=>{
        console.log("In serverside stop typing:",chat);
        if(!chat.members){
            return console.log('Members not present in stop typing:');
        }

        chat.members.forEach(userid => {
            if(userid == chat.myid) return;
            socket.in(userid).emit('stop typing', chat);
        });
    })

    socket.on('new message',(newmessage)=>{
        var chat = newmessage.chat;

        if(!chat.members){
            return console.log('Members not present in new message:');
        }

        chat.members.forEach(userid => {
            if(userid == newmessage.sender._id) return;
            socket.to(userid).emit('messagerecieve', newmessage);
        });
    })

    


    socket.on('disconnect',()=>{
        const onlineuserid = [...onlineuser.entries()].find(([_,socketid])=>socketid === socket.id)?.[0];
        // by [...onlineuser.entries()] it will convert all entries into array:
        
        if(onlineuserid){
            onlineuser.delete(onlineuserid);
            io.emit('connected users',Array.from(onlineuser.keys()));
        }

        console.log('Socket disconnected successfully from backend:');
    })
})

const port = process.env.PORT;
const DB_url = process.env.DATABASE_URI;

DBconnection(DB_url);

//middlewares
app.use(cors({
    origin:['http://localhost:5173','http://localhost:4173', process.env.CLIENT_URL],
    credentials: true// Allows the server to accept and respond with credentials (like cookies)     //can't use it without specifying origins: means can't use with '*' because of protection:
    
}));
app.use(express.json());//required for Content-Type: application/json
app.use(express.urlencoded({extended: false}));// required for Content-Type":"multipart/form-data"
app.use(cookieParser());//used to read cookie present in request:




//routes
app.use('/api/v1/user', userroute)
app.use('/api/v1/chat', chatroute)
app.use('/api/v1/message',messageroute)





//Error middleware
app.use(errormiddleware);
//Error middleware


//My Backend Code for providing staticfile(unchangable files like html,js,etc) from frontend dist folder 

const dirpath = path.resolve();
app.use(express.static(path.join(dirpath,'dist')));

app.get('*',(req,res)=>{
    res.sendFile(path.join(dirpath, "dist","index.html"));
});

//Backend code ends here:


server.listen(port, ()=>{
    console.log(`app is listening on port ${port}`)
})
