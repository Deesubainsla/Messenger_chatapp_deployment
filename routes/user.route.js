import express from 'express'
import { dltallmsg, getalluser, getanyprofile, getmyprofile, login, logout, signin } from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js';
import isAuthenticated from '../middlewares/Authentication.middleware.js';

const route = express.Router();

route.post('/login',login);
route.post('/signin',upload.single('avatar'),signin);

//routes where user is required so authenication is required:
route.use(isAuthenticated);//available for all route after this: make req.user available
route.get('/getalluser',getalluser);
route.get("/getprofile", getmyprofile);
route.get("/getanyprofile", getanyprofile);
route.delete("/logout", logout);
route.delete("/dltallmsg", dltallmsg);

export default route