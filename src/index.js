import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import app from "./app";

// Inject environment variables defined in the `.env` file placed at the root of the project.
dotenv.config();

/** @type {(url: string, options: mongoose.ConnectionOptions) => Promise<void>} */
const connectToDatabase = async (url, options) => {
  console.info(`Connecting to database "${url}"`);
  try {
    await mongoose.connect(url, {
      // Use the new MongoDB driver implementation for parsing connection strings.
      // See: https://mongoosejs.com/docs/deprecations.html#the-usenewurlparser-option
      useNewUrlParser: true,
      // Use the MongoDB driver `createIndex()` function instead of the deprecated `ensureIndex()`
      // See: https://mongoosejs.com/docs/deprecations.html#ensureindex
      useCreateIndex: true,
      // Allow the MongoDB driver to periodically check for changes in a MongoDB shared cluster.
      // See: https://mongoosejs.com/docs/deprecations.html#useunifiedtopology
      useUnifiedTopology: true,

      ...options,
    });

    // Once connected to the database, we listen for process shutdown signals and
    // close the connection gracefully.
    const disconnectFromDatabase = async () => {
      console.info(`Disconnecting from database ${url}`);
      await mongoose.connection.close();
      console.info(`Disconnected from database ${url}`);
    };
    process.once("SIGINT", disconnectFromDatabase).once("SIGTERM", disconnectFromDatabase);

    console.info(`Connected to database "${url}"`);
  } catch (error) {
    console.error(`Failed to connect to database "${url}"`);
    throw error;
  }
};

/** @type {(app: http.RequestListener, options: import('net').ListenOptions) => Promise<void>} */
const startHTTPServer = async (app, options) => {
  const address = `http://${options.host}:${options.port}`;
  console.info(`Starting HTTP server on "${address}"`);
  return new Promise((resolve, reject) => {
    http
      .createServer(app)
      .listen(options, () => {
        console.info(`HTTP server started on "${address}"`);
        return resolve();
      })
      .on("error", (error) => {
        console.error(`Failed to start HTTP server on "${address}"`);
        reject(error);
      });
  });
};

/** @type {(app: http.RequestListener) => Promise<void>} */
const startServer = async (app) => {
  console.info("Starting server");
  try {
    await Promise.all([
      // Retrieve mongodb information from environement variables and connect to the database.
      // While the connection is being established, mongoose will buffer operations.
      // See: https://mongoosejs.com/docs/connections.html#buffering
      connectToDatabase(process.env.MONGODB_URL, {
        user: process.env.MONGODB_USER,
        pass: process.env.MONGODB_PASSWORD,
      }),

      // Retrieve HTTP server host and port from environment variables,
      // create HTTP server and listen to connections.
      startHTTPServer(app, {
        host: process.env.HOST,
        port: parseInt(process.env.PORT, 10),
      }),
    ]);
    console.info("Server started");
  } catch (error) {
    // If something fails during start up (http server or database connection),
    // we stop the server process.
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer(app);

export default app;
