/**
 * Script to check and verify all MongoDB indexes
 * 
 * Usage:
 * - npx tsx scripts/check-indexes.ts
 * - npm run db:check-indexes
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

interface IndexInfo {
  name: string;
  fields: Record<string, number>;
  unique?: boolean;
  sparse?: boolean;
}

const checkIndexes = async () => {
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

    console.log("📊 Checking indexes for all collections...\n");

    let totalIndexes = 0;
    const indexSummary = [];

    for (const { name, model } of models) {
      try {
        console.log(`📋 ${name}:`);
        const indexes = await (model.collection as any).getIndexes();
        console.log(`   Total indexes: ${Object.keys(indexes).length}`);

        // Extract and display non-default indexes
        const customIndexes = Object.entries(indexes)
          .filter(([key]) => key !== "_id_")
          .map(([key, index]: any) => ({
            name: key,
            fields: index.key || {},
            unique: index.unique || false,
            sparse: index.sparse || false,
          }));

        if (customIndexes.length > 0) {
          customIndexes.forEach((idx: IndexInfo) => {
            const fieldStr = Object.entries(idx.fields)
              .map(([field, direction]: any) => {
                const dir = direction === 1 ? "ASC" : direction === -1 ? "DESC" : String(direction);
                return `${field}:${dir}`;
              })
              .join(", ");

            const opts = [];
            if (idx.unique) opts.push("UNIQUE");
            if (idx.sparse) opts.push("SPARSE");
            const optsStr = opts.length > 0 ? ` [${opts.join(", ")}]` : "";

            console.log(`   ├─ ${fieldStr}${optsStr}`);
          });
        } else {
          console.log("   ├─ No custom indexes");
        }

        // Get index statistics if available
        try {
          const stats = await (model.collection as any).aggregate([
            { $indexStats: {} },
          ]).toArray();

          if (stats.length > 0) {
            const usedIndexes = stats.filter(
              (stat: any) => stat.accesses.ops > 0
            );
            if (usedIndexes.length > 0) {
              console.log(`   └─ Used indexes: ${usedIndexes.length}/${stats.length}`);
            }
          }
        } catch {
          // Index statistics may not be available on all deployments
        }

        console.log();
        indexSummary.push({
          collection: name,
          count: Object.keys(indexes).length - 1, // Exclude _id index
        });
        totalIndexes += Object.keys(indexes).length - 1;
      } catch (error) {
        console.error(`   ❌ Error checking ${name}:`, error);
      }
    }

    console.log("📊 Summary:");
    console.log("═".repeat(50));
    indexSummary.forEach(({ collection, count }) => {
      console.log(`${collection.padEnd(25)} | ${count} indexes`);
    });
    console.log("═".repeat(50));
    console.log(`Total custom indexes: ${totalIndexes}`);

    // Recommendations
    console.log("\n💡 Recommendations:");
    const expectedIndexes: Record<string, number> = {
      Blog: 8,
      Topic: 7,
      User: 8,
      Problem: 6,
      BlogCollection: 5,
      Alltopic: 1,
      TopicPublicOrPrivate: 3,
    };

    let allGood = true;
    for (const { collection, count } of indexSummary) {
      const expected = expectedIndexes[collection] || 0;
      if (count < expected) {
        console.log(`   ⚠️  ${collection}: Found ${count}, expected ${expected}`);
        allGood = false;
      }
    }

    if (allGood) {
      console.log("   ✅ All indexes are present!");
    } else {
      console.log("\n   Run 'npx tsx scripts/init-indexes.ts' to create missing indexes");
    }

    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error during index check:", error);
    process.exit(1);
  }
};

// Run the check
checkIndexes().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
