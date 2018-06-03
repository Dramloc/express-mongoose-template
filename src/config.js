import dotenv from 'dotenv';

dotenv.config();

export default {
  host: process.env.HOST,
  port: process.env.PORT,
  mongodb: {
    url: `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`,
    options: {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD,
    },
  },
};
