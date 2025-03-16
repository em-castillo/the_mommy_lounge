import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let db: Db;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your environment variables.");
}

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db("mommy");
  }
  return { client, db };
}

export { connectToDatabase };
