import Boom from "@hapi/boom";
import { createLogger } from "./createLogger.js";

const logger = createLogger("error-handler");

export const errorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }
  logger.error(err.stack);
  const { output } = Boom.boomify(err);
  return res
    .set(output.headers)
    .status(output.statusCode)
    .json(output.payload);
};
