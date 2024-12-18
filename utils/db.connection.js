import mongoose from "mongoose"

const DBconnection = (url)=>{
   
        //one method is this by promise 
        mongoose.connect(url)
            .then((data)=>{
                console.log(`DBconnected successfully with ${data.connection.host}`);
               
            })
            .catch((err)=>{
                console.log("Error occured in DBconnection ", err);
            })

        //you can also use try catch async await: as mern book app

    
}

export default DBconnection