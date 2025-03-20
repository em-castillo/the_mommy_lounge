import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient | null = null;
let db: Db | null = null;

if (!uri) {
  throw new Error("Please add MONGODB_URI to your environment variables.");
}

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db("mommy");
  }

  if (!db) {
    throw new Error("Database connection failed.");
  }

  return { client, db };
}
