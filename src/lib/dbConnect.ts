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
        const db = await mongoose.connect(mongoUri, {
            // Connection pooling settings for better performance
            maxPoolSize: 10,
            minPoolSize: 5,
            // Socket timeout
            socketTimeoutMS: 45000,
            // Server selection timeout
            serverSelectionTimeoutMS: 5000,
            // Retry writes for better reliability
            retryWrites: true,
            // Family preference (0 = both, 4 = IPv4, 6 = IPv6)
            family: 4,
        });
        connection.isConnected = db.connections[0].readyState;
    } catch (error) {
        connection.isConnected = 0;
        throw error;
    }
}

export default dbConnect;