import mongoose from "mongoose";

interface ConnectionObject {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect() {
    if(connection.isConnected){
        console.log('Already connected to database')
        return
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI || '', {})
        connection.isConnected = db.connections[0].readyState
        console.log('DB connected successfully')
    } catch (error) {
        console.log('Connection to DB failed: ',error)
        process.exit()
    }
}

export default dbConnect