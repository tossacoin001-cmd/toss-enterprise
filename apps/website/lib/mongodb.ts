import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "toss_enterprise";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> | null {
  if (!uri) return null;

  // Reuse the client across hot reloads/serverless invocations instead of
  // opening a new connection per request.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  return global._mongoClientPromise;
}

export async function getDb() {
  const clientPromise = getClientPromise();
  if (!clientPromise) return null;
  const client = await clientPromise;
  return client.db(dbName);
}
