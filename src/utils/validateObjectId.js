import Boom from "@hapi/boom";
import { isValidObjectId } from "mongoose";

/**
 * Forwards a `Boom.badRequest` error (400) if the parameter is not a valid MongoDB ObjectId.
 * @type {import('express').RequestParamHandler}
 */
export const validateObjectId = (req, res, next, value, name) => {
  return isValidObjectId(value)
    ? next()
    : next(Boom.badRequest(`Invalid parameter \`${name}\` with value \`${value}\`.`));
};
