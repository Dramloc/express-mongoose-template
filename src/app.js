import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import pino from "express-pino-logger";
import helmet from "helmet";
import articlesRouter from "./articles/index.js";
import { errorHandler } from "./utils/errorHandler.js";
import { notFoundHandler } from "./utils/notFoundHandler.js";
import { validationErrorHandler } from "./utils/validationErrorHandler.js";

const app = express();

if (process.env.NODE_ENV !== "production") {
  // These middlewares are added for development purposes.
  // Depending on the use case, you can move these middleware outside of this `if` block or
  // you can edit your HTTP server (e.g.: Apache, NGINX, etc.) to handle the following cases:

  // Add gzip compression.
  app.use(compression());
  // Add CORS headers.
  app.use(cors());
}

// Expose a logger as `log` on the express `req` parameter and log requests.
// Logging every request have some caveats if they contain sensitive information,
// consider redacting some information using `pino-noir`.
app.use(pino());
// Add security headers to every requests.
app.use(helmet());
// Allow express to parse JSON bodies.
app.use(bodyParser.json());

// Our application routes:
app.use("/api/v1/articles", articlesRouter);

// Handle requests matching no routes.
app.use(notFoundHandler);
// Add validation error information
app.use(validationErrorHandler);
// Handle errors passed using `next(error)`.
app.use(errorHandler);

export default app;
