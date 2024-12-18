import express from "express";
import isAuthenticated from "../middlewares/Authentication.middleware.js";
import { getmessages, newmessage } from "../controllers/message.controller.js";


const app = express.Router();

app.use(isAuthenticated);

app.get('/getmessages',getmessages);
app.post('/newmessage',newmessage);

export default app