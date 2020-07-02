import Boom from "@hapi/boom";
import { isValidObjectId } from "mongoose";

export const validateObjectId = (req, res, next, value, name) => {
  return isValidObjectId(value)
    ? next()
    : next(Boom.badRequest(`Invalid parameter \`${name}\` with value \`${value}\`.`));
};
