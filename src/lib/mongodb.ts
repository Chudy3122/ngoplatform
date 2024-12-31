import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const uri: string = process.env.MONGODB_URI || '';
const dbName: string = process.env.MONGODB_DB || 'your_default_db_name';

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local\n' +
    'Example: MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority'
  );
}

export async function connectToDatabase() {
  try {
    if (cachedClient && cachedDb) {
      return { client: cachedClient, db: cachedDb };
    }

    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    const client = new MongoClient(uri, {
      // Add MongoDB client options here if needed
    });

    await client.connect();
    const db = client.db(dbName);

    // Test the connection
    await db.command({ ping: 1 });
    console.log("Successfully connected to MongoDB.");

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Optional: Add a function to close the connection
export async function closeDatabase() {
  try {
    if (cachedClient) {
      await cachedClient.close();
      cachedClient = null;
      cachedDb = null;
      console.log('MongoDB connection closed.');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
}