import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  const mongoUrl = process.env.Mongo_url;

  if (!mongoUrl) {
    throw new Error("Mongo_url is not configured");
  }

  try {
    const db = await mongoose.connect(mongoUrl);

    connection.isConnected = db.connections[0].readyState;

    console.log("DB Connected Successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export default dbConnect;