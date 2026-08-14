import mongoose from "mongoose";


type ConnectionObject ={
    isConnected?: number
}


const connection: ConnectionObject ={}

async function dbConnect(): Promise<void> {
    if (connection.isConnected){
        console.log("Already connected to database");
    }

    try{
      const db=  await mongoose.connect(process.env.Mongo_url || '', {})
      console.log("DB Connected Successfuly");
    }
    catch (error) {
        console.log("Database connnection failed", error);
        process.exit(1)
    }
}

export default dbConnect;