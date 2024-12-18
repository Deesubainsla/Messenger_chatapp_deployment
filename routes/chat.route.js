import express from 'express'
import isAuthenticated from '../middlewares/Authentication.middleware.js';
import { getchat, newchat, newGroup, getmygroups, addmember, removemember, leavegroup, getmychat, deletechat } from '../controllers/chat.controller.js';

const app = express.Router();


//routes where user is required so authenication is required:
app.use(isAuthenticated);//available for all route after this: make req.user available

app.post('/newgroup',newGroup);
app.post('/newchat',newchat);
app.get('/getchat',getchat);
app.get('/getmygroups',getmygroups);
app.get('/getmychat',getmychat);
app.put('/addmember',addmember);
app.put('/removemember', removemember);
app.delete('/leavegroup/:chatid', leavegroup);//prefered to send data by dynamic url in case of delete request.
app.delete('/deletechat',deletechat);



export default app
