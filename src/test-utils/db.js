import mongoose from "mongoose";

export const startDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    dbName: `jest-${process.env.JEST_WORKER_ID}`,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
};

export const dropDatabase = async () => {
  await mongoose.connection.dropDatabase();
};

export const stopDatabase = async () => {
  await mongoose.connection.close();
};
