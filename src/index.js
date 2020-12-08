import http from "http";
import mongoose from "mongoose";
import ora from "ora";
import app from "./app";

/** @type {(url: string, options: mongoose.ConnectionOptions) => Promise<void>} */
const connectToDatabase = async (url, options) => {
  const spinner = ora(`Connecting to database "${url}"`).start();
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
      const spinner = ora(`Disconnecting from database "${url}"`).start();
      await mongoose.connection.close();
      spinner.succeed(`Disconnected from database "${url}"`);
    };
    process.once("SIGINT", disconnectFromDatabase).once("SIGTERM", disconnectFromDatabase);

    spinner.succeed(`Connected to database "${url}"`);
  } catch (error) {
    spinner.fail(`Failed to connect to database "${url}"`);
    throw error;
  }
};

/** @type {(app: http.RequestListener, options: import('net').ListenOptions) => Promise<void>} */
const startHTTPServer = async (app, options) => {
  const address = `http://${options.host}:${options.port}`;
  const spinner = ora(`Starting HTTP server on "${address}"`).start();
  return new Promise((resolve, reject) => {
    const server = http
      .createServer(app)
      .listen(options, () => {
        // Once HTTP server is started, we listen for process shutdown signals and
        // close the server gracefully.
        const closeHTTPServer = async () => {
          const spinner = ora("Closing HTTP server").start();
          await server.close();
          spinner.succeed("HTTP server closed");
        };
        process.once("SIGINT", closeHTTPServer).once("SIGTERM", closeHTTPServer);
        spinner.succeed(`HTTP server started on "${address}"`);
        return resolve();
      })
      .on("error", (error) => {
        spinner.fail(`Failed to start HTTP server on "${address}"`);
        return reject(error);
      });
  });
};

/** @type {(app: http.RequestListener) => Promise<void>} */
const startServer = async (app) => {
  const spinner = ora("Starting server").start();
  try {
    await Promise.all([
      // Retrieve mongodb information from environement variables and connect to the database.
      // While the connection is being established, mongoose will buffer operations.
      // See: https://mongoosejs.com/docs/connections.html#buffering
      connectToDatabase(process.env.MONGO_URL, {
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASSWORD,
      }),

      // Retrieve HTTP server host and port from environment variables,
      // create HTTP server and listen to connections.
      startHTTPServer(app, {
        host: process.env.HOST,
        port: Number(process.env.PORT),
      }),
    ]);
    spinner.succeed("Server started");
  } catch (error) {
    // If something fails during start up (http server or database connection),
    // we stop the server process.
    console.error(error);
    spinner.fail("Failed to start server. See the error above for more information.");
    process.exit(1);
  }
};

startServer(app);

export default app;
