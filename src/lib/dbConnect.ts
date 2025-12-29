import mongoose from "mongoose";

interface ConnectionObject {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect() {
    if(connection.isConnected){
        return
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI || '', {})
        connection.isConnected = db.connections[0].readyState
    } catch (error) {
        process.exit()
    }
}

export default dbConnect