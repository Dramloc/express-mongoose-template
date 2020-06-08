import Boom from "@hapi/boom";
import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import RateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import MongoStore from "rate-limit-mongo";
import articlesRouter from "./articles";
import { errorHandler } from "./utils/errorHandler";
import { notFoundHandler } from "./utils/notFoundHandler";
import { validationErrorHandler } from "./utils/validationErrorHandler";

dotenv.config();

const app = express();

if (process.env.NODE_ENV !== "production") {
  // These middlewares are added for development purposes.
  // Depending on the use case, you can move these middleware outside of this `if` block or
  // you can edit your HTTP server (e.g.: Apache, NGINX, etc.) to handle the following cases:

  // Add gzip compression.
  app.use(compression());

  // Add CORS headers.
  app.use(cors());

  // Log HTTP requests
  app.use(morgan("dev"));
}

// Add security headers to every requests.
app.use(helmet());

// Allow express to parse JSON bodies.
app.use((req, res, next) => {
  bodyParser.json()(req, res, (err) => {
    return err ? next(badData(err.message)) : next();
  });
});

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set("trust proxy", 1);

// Limit request rate on API, `windowMs` and `max` can be adjusted to match the desired rate.
// Rate limits attempts are persisted using a MongoDB store to limit request rates accross multiple processes and servers.
// see https://github.com/nfriedly/express-rate-limit for more information
app.use(
  new RateLimit({
    store: new MongoStore({
      uri: process.env.MONGODB_URL,
      user: process.env.MONGODB_USER,
      password: process.env.MONGODB_PASSWORD,
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5000, // 5000 requests can be executed during the `windowMs` time window
    message: Boom.tooManyRequests("Too many requests, please try again later.").output.payload,
  })
);

// Our application routes:
app.use("/v1/articles", articlesRouter);

// Handle requests matching no routes.
app.use(notFoundHandler);

// Add validation error information
app.use(validationErrorHandler);

// Handle errors passed using `next(error)`.
app.use(errorHandler);

export default app;
