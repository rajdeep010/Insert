/**
 * Script to initialize and rebuild all MongoDB indexes
 * 
 * Usage:
 * - npx tsx scripts/init-indexes.ts
 * - npm run init-indexes
 */

import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import BlogModel from "@/model/Blog";
import TopicModel from "@/model/Topic";
import UserModel from "@/model/User";
import ProblemModel from "@/model/Problem";
import BlogCollectionModel from "@/model/BlogCollection";
import AlltopicModel from "@/model/Alltopic";
import TopicPublicOrPrivateModel from "@/model/Topicvisible";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const dbConnect = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined. Check your .env.local file.");
  }

  await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
    minPoolSize: 5,
  });
};

const initializeIndexes = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await dbConnect();
    console.log("✅ Connected to MongoDB\n");

    const models = [
      { name: "Blog", model: BlogModel },
      { name: "Topic", model: TopicModel },
      { name: "User", model: UserModel },
      { name: "Problem", model: ProblemModel },
      { name: "BlogCollection", model: BlogCollectionModel },
      { name: "Alltopic", model: AlltopicModel },
      { name: "TopicPublicOrPrivate", model: TopicPublicOrPrivateModel },
    ];

    console.log("📊 Initializing indexes for all collections...\n");

    for (const { name, model } of models) {
      try {
        console.log(`⏳ Processing ${name}...`);
        
        // Sync indexes - ensures all defined indexes exist
        await model.syncIndexes();
        
        const indexes = await (model.collection as any).getIndexes();
        console.log(`   ✅ Created/verified ${Object.keys(indexes).length} total indexes\n`);
      } catch (error) {
        console.error(`   ❌ Error processing ${name}:`, error);
      }
    }

    console.log("🎉 Index initialization complete!");
    console.log("\n📋 Summary of Indexes:\n");

    for (const { name, model } of models) {
      const indexes = await (model.collection as any).getIndexes();
      console.log(`${name}: ${Object.keys(indexes).length} indexes`);
      Object.entries(indexes).forEach(([key, index]: any) => {
        if (key !== "_id_") {
          const indexStr = Object.entries(index.key || {})
            .map(([field, direction]: any) => `${field}:${direction}`)
            .join(", ");
          console.log(`  - ${indexStr}`);
        }
      });
    }

    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error during index initialization:", error);
    process.exit(1);
  }
};

// Run the initialization
initializeIndexes().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
