import Boom from "@hapi/boom";
import pino from "pino";

const log = pino({ name: "error" });

/**
 * @typedef FormattedError
 * @property {number} statusCode The error HTTP status code (typically 4xx or 5xx)
 * @property {string} error The error HTTP status message (e.g. "Bad Request", "Internal Server Error")
 * @property {string} message The error message
 */

/**
 * Format errors passed down the middleware chain using `Boom.boomify`.
 * Error stack trace is also logged.
 * If the `err` variable is not a Boom error, the status code will defaults to 500.
 * Otherwise, the status code associated with the Boom error will be used.
 * @type {import("express-serve-static-core").ErrorRequestHandler<import("express-serve-static-core").ParamsDictionary, FormattedError>}
 */
export const errorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  log.error(err.stack);
  const { output } = Boom.boomify(err);
  return res
    .set(output.headers)
    .status(output.statusCode)
    .json(output.payload);
};
