import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import articlesRouter from "./articles";
import { errorHandler } from "./utils/errorHandler";
import { notFoundHandler } from "./utils/notFoundHandler";
import { validationErrorHandler } from "./utils/validationErrorHandler";

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
app.use(bodyParser.json());

// Our application routes:
app.use("/v1/articles", articlesRouter);

// Handle requests matching no routes.
app.use(notFoundHandler);
// Add validation error information
app.use(validationErrorHandler);
// Handle errors passed using `next(error)`.
app.use(errorHandler);

export default app;
