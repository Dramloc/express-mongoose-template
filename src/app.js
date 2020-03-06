import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import articlesRouter from "./articles/index.js";
import { errorHandler } from "./utils/errorHandler.js";
import { notFoundHandler } from "./utils/notFoundHandler.js";
import { oraMiddleware } from "./utils/oraMiddleware.js";

const app = express();

if (process.env.NODE_ENV !== "production") {
  // These middlewares are added for development purposes.
  // Depending on the use case, you can move these middleware outside of this `if` block or
  // you can edit your HTTP server (e.g.: Apache, NGINX, etc.) to handle the following cases:

  // Add HTTP request logs to the console.
  app.use(oraMiddleware);
  // Add gzip compression.
  app.use(compression());
  // Add CORS headers.
  app.use(cors());
}

// Add security headers to every requests.
app.use(helmet());
// Allow express to parse JSON bodies.
app.use(bodyParser.json());

// Our application routes:
app.use("/api/v1/articles", articlesRouter);

// Handle requests matching no routes.
app.use(notFoundHandler);
// Handle errors passed using `next(error)`.
app.use(errorHandler);

export default app;
