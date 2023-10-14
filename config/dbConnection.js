import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

export default async function connectDatabase() {
  const mongoServer = await MongoMemoryServer.create({ instance: { port: 20131 } });
  const mongoURI = mongoServer.getUri();

  await mongoose.connect(mongoURI, { dbName: 'boo_db' });
  console.log(`MongoDB connection successful ${mongoURI}`);

  // Return the mongoose connection object
  return mongoose.connection;
}
