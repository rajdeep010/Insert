import mongoose from "mongoose";

interface ConnectionObject {
    isConnected?: number;
}

const connection: ConnectionObject = {};

async function dbConnect() {
    if (connection.isConnected) {
        return;
    }

    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined");
    }

    try {
        const db = await mongoose.connect(mongoUri);
        connection.isConnected = db.connections[0].readyState;
    } catch (error) {
        connection.isConnected = 0;
        throw error;
    }
}

export default dbConnect;